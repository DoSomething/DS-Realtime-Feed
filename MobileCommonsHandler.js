var main = require('./index');

var mc_config = main.mc_config;

var parseString = require('xml2js').parseString;
var request = require('superagent');

var textMessages = [];
var messageIntervalID = 0;

//Update this

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
 * Used to send messages over a period of 1 minute instead of a single large
 * batch
 */
function distributeMessages(){
  var messagesInterval = 60 / textMessages.length;
  messageIntervalID = setInterval(sendTextMessage, messagesInterval * 1000);
}

/*
 * Sends the txt message at the top of the stack & removes it from the array
 */
function sendTextMessage(message){
  if(textMessages.length == 0){
    clearInterval(messageIntervalID);
    return;
  }
  io.emit('text', textMessages[0], {for: 'everyone'});
  textMessages.splice(0, 1);
}

getMessages(1);
