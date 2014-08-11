var request = require('superagent');

var main = require('../index');
var app_config = main.app_config;

var apiKey = app_config.google.apiKey;
var calendarID = app_config.google.calendarID;

/*
 * Grabs raw calendar events from Google API ordered by start time
 */
this.getEvents = function(callback){
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth() + 1;
  var date = d.getDate();

  if(month < 9){
    month = '0' + month;
  }
  if(date < 9){
    date = '0' + date;
  }

  var midnight = year + '-' + month + '-' + date + 'T00:00:00Z';

  request
    .get('https://www.googleapis.com/calendar/v3/calendars/' + calendarID + '/events')
    .query({
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: midnight,
      key: apiKey
    })
    .accept('application/json')
    .type('application/json')
    .end(function(res){
      callback(res.res.text);
    });
}
