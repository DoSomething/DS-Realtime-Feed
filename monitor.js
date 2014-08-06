mb_config = require(__dirname + '/config/mb_config.json');

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var amqp = require('amqp');
var spawn = require('child_process').spawn;

var timerId = -1337;
var conn;
var buffer = 1000 * 60;

function establishConnection(){
  console.log("Establishing...", timestamp());
  conn = amqp.createConnection({
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
    console.log("Connected!", timestamp());
    reset();
  });
}

function reset(){
  console.log("Timer reset started...", timestamp());
  clearTimeout(timerId);
  setTimeout(function(){
    console.log("Timer reset complete!", timestamp());
    timerId = setTimeout(fix, buffer);
    establishConnection();
  }, buffer); //buffer to prevent firing off requests every second
}

function fix(){
  console.log("Applying healing potions, standby...", timestamp());
  var command = 'vpnc-disconnect; sleep 5; vpnc dashboard.conf; sleep 5; forever restart index.js; sleep 5; forever restart monitor.js;';
  spawn('sh', ['-c', command], { stdio: 'inherit' });
}

http.listen(3322, function(){
  console.log("Monitor started! listening on 3322", timestamp());
  establishConnection();
  timerId = setTimeout(fix, buffer);
});

/**
 * https://gist.github.com/hurjas/2660489
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */
function timestamp() {
// Create a date object with the current time
  var now = new Date();

// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";

// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

// If hour is 0, set it to 12
  time[0] = time[0] || 12;

// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }

// Return the formatted string
  return date.join("/") + " " + time.join(":") + " " + suffix;
}
