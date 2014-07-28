/*
 * Configs
 */
var mb_config = require(__dirname + '/config/mb_config.json');
var mc_config = require(__dirname + '/config/mc_config.json');
var gc_config = require(__dirname + '/config/gc_config.json');
var countFile = require(__dirname + '/count.json');

/*
 * Modules
 */
var fs = require("fs");
var express = require('express');
var request = require('superagent');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var amqp = require('amqp');
var parseString = require('xml2js').parseString;
var PHPUnserialize = require('php-unserialize');
var cheerio = require('cheerio');
var stathat = require('stathat');

var totalUsers = countFile.total;
var currentTime = new Date();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//Date functions
Date.prototype.subHours = function(h) {
   this.setTime(this.getTime() - (h*60*60*1000));
   return this;
}

Date.prototype.subMinutes = function(m) {
    this.setTime(this.getTime() - (m*60000));
    return this;
}

Date.prototype.daysBetween = function(date1, date2) {
  var one_day=1000*60*60*24;
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();
  var difference_ms = date2_ms - date1_ms;
  return Math.round(difference_ms/one_day);
}

//SocketIO
//--------
io.on('connection', function(socket) {
  console.log("Client connected");

  socket.on('disconnect', function(){
    console.log('Client disconnected');
  });
});


//RabbitMQ
//--------

var conn = amqp.createConnection({
  host: mb_config.host,
  port: mb_config.port,
  login: mb_config.login,
  password: mb_config.password,
  connectionTimeout: mb_config.connectionTimeout,
  authMechanism: mb_config.authMechanism,
  vhost: mb_config.vhost,
  noDelay: mb_config.noDelay,
  ssl: { enabled : mb_config.ssl_enabled }
},
{
  defaultExchangeName: mb_config.defaultExchangeName
});

/*
 * Connect to queue & build HTML elements based off the data, push results
 * over SocketIO to clients
 */
conn.on('ready', function(){
  console.log('rabbit connection ready');
  var q = conn.queue('activityStatsQueue', {
    passive: mb_config.passive,
    durable: mb_config.durable,
    exclusive: mb_config.exclusive,
    autoDelete: mb_config.autoDelete
  }, function (q) {
    console.log('Queue ' + q.name + ' is open');

    q.bind('#');

    q.subscribe(function (message) {
      var serializedMessage = PHPUnserialize.unserialize(message.data.toString());
      var activity = serializedMessage.activity;
      switch(activity){
        case "user_register":
          totalUsers++;
          io.emit('signup', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + '</p> created an account!</p>', {for: 'everyone'});
          break;
        case "campaign_signup" :
          io.emit('campaign', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + "</p> signed up for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>", {for: 'everyone'});
          break;
        case "campaign_reportback":
          io.emit('report back', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + " </p> reported back for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>", {for: 'everyone'});
          io.emit('report back image', serializedMessage.merge_vars.REPORTBACK_IMAGE_MARKUP, {for: 'everyone'});
          break;
        case "campaign_group_signup":
          break;
        case "user_password":
          break;
        default:
          break;
      }
    });

  });
});


//Mobile Commons
//--------------

var textMessages = [];
var messageIntervalID = 0;

/*
 * Grabs all text messages in XML format from the last minute, converts them to
 * JSON, builds HTML element and saves them in an array.
 * Function also supports pagination due to how Mobile Commons sends back data.
 */
function getMessages(pageNumber){
  var now = new Date();
  var minAgo = new Date();
  minAgo.subMinutes(1);

  request
    .get('https://secure.mcommons.com/api/messages')
    .auth(mc_config.user, mc_config.pass)
    .query({start_time: minAgo.toISOString(), include_profile: 'false', end_time: now.toISOString(), limit: '100', page: pageNumber, include_profile: 'true'})
    .buffer()
    .accept('xml')
    .type('xml')
    .end(function(res){
      parseString(res.text, function (err, result) {
          var jsonResult = JSON.stringify(result);
          if(jsonResult == undefined){
            return;
          }
          var obj = JSON.parse(jsonResult);

          if(obj.response.messages[0].message == undefined){
            return
          }

          for(var index = 0; index < obj.response.messages[0].message.length; index++){
            var message = obj.response.messages[0].message[index];
            if(message == undefined){
              continue;
            }
            if(message.profile[1] == undefined){
              continue;
            }
            if(message['$'].type == "opt_in"){
              totalUsers++;
            }
            if(message.profile[1].first_name != ''){
              var string = '<p><p class="name">' + message.profile[1].first_name + "</p> sent us a text message!</p>";
              textMessages.push(string);
            }
          }

          var page = parseInt(obj.response.messages[0]['$'].page);
          var totalPages = parseInt(obj.response.messages[0]['$'].page_count);
          if(page >= totalPages){
            resetTimer();
            distributeMessages();
          }
          else{
            getMessages(page + 1);
          }
      });
    });

}

/*
 * Grabs the latest messages after 61 seconds.
 * Does not use interval because the timer waits for the last 'GetMessages' to
 * finish. Uses a seperate function to call getMessages in order to pass the
 * start page (1)
 */
function resetTimer(){
  setTimeout(callGetMessages, 61 * 1000);
}

function callGetMessages(){
  getMessages(1);
}

/*
 * Sends the txt message at the top of the stack & removes it from the array
 */
function sendTextMessage(){
  if(textMessages.length == 0){
    clearInterval(messageIntervalID);
    return;
  }
  io.emit('text', textMessages[0], {for: 'everyone'});
  textMessages.splice(0, 1);
}

/*
 * Used to send messages over a period of 1 minute instead of a single large
 * batch
 */
function distributeMessages(){
  var messagesInterval = 60 / textMessages.length;
  messageIntervalID = setInterval(sendTextMessage, messagesInterval * 1000);
}


//Users
//-----

/*
 * Function for replacing in a string
 */
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

/*
 * Grabs the total users from the Data dashboard and returns it in a callback
 */
function calculateTotalUsers(callback){
  var url = "http://dashboards.dosomething.org/";
  var total = 0;
  request
    .get(url)
    .end(function(res){
      var pageHTML = res.text;
      var $ = cheerio.load(pageHTML);
		      var data = $('#total_member_count').text().replace("CURRENT MEMBERS: ", "");
          var num = parseInt(replaceAll(',', '', data));
          callback(num);
  });
}

/*
 * Pushes the current user total to the client ticker
 */
function pushUserTotal(){
  io.emit('ticker', totalUsers, {for: 'everyone'});
}

/*
 * Gets the remote total and determines if we should use our local count or the
 * remote count. Also saves our current count to file.
 */
function processUsers(){
  calculateTotalUsers(function(remoteTotal){
    if(remoteTotal > totalUsers){
      totalUsers = remoteTotal;
    }
    countFile.total = totalUsers;
    fs.writeFile("count.json", JSON.stringify(countFile));
    pushUserTotal();
  });
}


// Google Cal.
//-----------
var apiKey = gc_config.apiKey;
var calendarID = gc_config.calendarID;

/*
 * Returns all of the events in our Google Cal. ordered by start time
 */
app.get('/events', function(req, res){
  request
   .get('https://www.googleapis.com/calendar/v3/calendars/' + calendarID + '/events?orderBy=startTime&singleEvents=true&key=' + apiKey)
   .accept('application/json')
   .type('application/json')
   .end(function(gRes){
     res.json(gRes.res.text);
   });
});


//Campaigns
//-------------
var url = "http://beta.dosomething.org/api/v1/content/2401.json";
var campaigns = [];

/*
 * title      The title of the campaign
 * imageURL   The link to the square high-res campaign photo
 * signups    The total web signup count
 * daysLeft   The total days left in the campaign
 */
var Camp = function(title, imageURL, signups, daysLeft){
  this.title = title;
  this.imageURL = imageURL;
  this.signups = signups;
  this.daysLeft = daysLeft;
}

/*
 * Builds Camp objects out of the current staff picks and returns an array 
 */
app.get('/staff-picks', function(req, res){
  request
    .get(url)
    .type('application/json')
    .accept('application/json')
    .end(function(dRes){
      var response = JSON.parse(dRes.text);
      var date = new Date();
      var daysLeft = date.daysBetween(date, new Date(response.high_season_end));
      var responseCamp = new Camp(response.title, response.image_cover.url.square.raw, response.stats.signups, daysLeft);
      campaigns.push(responseCamp);
      res.json(JSON.stringify(campaigns));
    });
});

//Setup HTTP & data fetchers
//--------------------------
http.listen(3000, function(){
  getMessages(1);
  setInterval(processUsers, 5 * 1000);
  console.log("listening on 3000");
});
