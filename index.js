var mb_config = require(__dirname + '/config/mb_config.json');
var mc_config = require(__dirname + '/config/mc_config.json');
var gc_config = require(__dirname + '/config/gc_config.json');

var express = require('express');
var request = require('superagent');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var amqp = require('amqp');
var parseString = require('xml2js').parseString;
var PHPUnserialize = require('php-unserialize');
var cheerio = require('cheerio');

var totalUsers = 0;
var currentTime = new Date();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

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
          console.log(serializedMessage);
          io.emit('report back', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + " </p> reported back for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>", {for: 'everyone'});
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

//Txt Messages

var textMessages = [];
var messageIntervalID = 0;

Date.prototype.subHours = function(h) {
   this.setTime(this.getTime() - (h*60*60*1000));
   return this;
}

Date.prototype.subMinutes = function(m) {
    this.setTime(this.getTime() - (m*60000));
    return this;
}

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
            console.log(message['$'].type);
            if(message['$'].type == "opt_in"){
              totalUsers++;
              console.log(totalUsers);//35
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

function resetTimer(){
  setTimeout(callGetMessages, 61 * 1000);
}

function callGetMessages(){
  getMessages(1);
}

function sendTextMessage(){
  if(textMessages.length == 0){
    clearInterval(messageIntervalID);
    return;
  }
  io.emit('text', textMessages[0], {for: 'everyone'});
  textMessages.splice(0, 1);
}

function distributeMessages(){
  var messagesInterval = 60 / textMessages.length;
  messageIntervalID = setInterval(sendTextMessage, messagesInterval * 1000);
}

//Users
//-----

function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

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
          totalUsers = num;
          callback();
  });
}

function pushUserTotal(){
  io.emit('ticker', totalUsers, {for: 'everyone'});
}

function calculateFakeTime(){
  calculateTotalUsers(function(){
    setInterval(pushUserTotal, 1000); //So we don't have to update the ticker manually everytime we change the number
  });
}

// Cal. stuff
//-----------
var apiKey = gc_config.apiKey;
var calendarID = gc_config.calendarID;

app.get('/events', function(req, res){
  request
   .get('https://www.googleapis.com/calendar/v3/calendars/' + calendarID + '/events?key=' + apiKey)
   .accept('application/json')
   .type('application/json')
   .end(function(gRes){
     res.json(gRes.res.text);
   });
});


//Campaign Hack
//-------------
var url = "dosomething.org";
var campaigns = [];

var camp = function(title, imageURL){
  this.title = title;
  this.imageURL = imageURL;
}

app.get('/staff-picks', function(req, res){
  request
    .get(url)
    .end(function(dRes){
      var pageHTML = dRes.text;
      var $ = cheerio.load(pageHTML);

      $('div.staff-pick').each(function(i, element){
        var imgElement = element.next.next;
        var imgURL = imgElement.attribs['data-src'];
        var title = imgElement.next.next.children[1].children[0].data;
        campaigns.push(new camp(title, imgURL));
      });

      res.json(JSON.stringify(campaigns));
    });

});

//Setup
//-----
http.listen(3000, function(){
  getMessages(1);
  calculateFakeTime();
  //setInterval(calculateTotalUsers, 5 * 1000);
  console.log("listening on 3000");
});
