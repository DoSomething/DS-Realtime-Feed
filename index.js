// [][][] [][][] [][][] [][][] []   [] [][][] [][][] []    []
// []  [] []       []     []   []   []   []     []    []  []
// [][][] []       []     []    [] []    []     []      []
// []  [] []       []     []    [] []    []     []      []
// []  [] [][][]   []   [][][]    []   [][][]   []      []

// [][][] [][][] [][][] [][]
// []     []     []     []  []
// [][]   [][]   [][]   []  []
// []     []     []     []  []
// []     [][][] [][][] [][]

// Get it? It's made of boxes, just like our activity feed. Ba-zing!

var app_config = require(__dirname + '/config/app_config.json');
this.gc_config = require(__dirname + '/config/gc_config.json');
this.mc_config = require(__dirname + '/config/mc_config.json');
this.mb_config = require(__dirname + '/config/mb_config.json');

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;

var googleCalHandler = require(__dirname + '/handlers/GoogleCalHandler');
var campaignHandler = require(__dirname + '/handlers/CampaignHandler');
var messageBrokerHandler = require(__dirname + '/handlers/MessageBrokerHandler');
var mobileCommonsHandler = require(__dirname + '/handlers/MobileCommonsHandler');
var userCountHandler = require(__dirname + '/handlers/UserCountHandler');

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

/*
 * Sends an activity message to all connected clients
 */
this.sendActivityMessage = function (type, message){
  io.emit(type, message, {for: 'everyone'});
}

/*
 * Pushes the current user total to the client ticker
 */
this.pushUserTotal = function (total){
  io.emit('ticker', total, {for: 'everyone'});
}

/*
 * Returns all of the events in our Google Cal. ordered by start time in
 * JSON format.
 */
app.get('/events', function(req, res) {
  googleCalHandler.getEvents(function onEventGet(eventResponse){
    res.json(eventResponse);
  });
});

/*
 * Gets all the current staff pick campaigns and returns in JSON format
 */
app.get('/staff-picks', function(req, res){
  campaignHandler.getCampaigns(function onCampaignsGet(campaignResponse){
    res.json(campaignResponse);
  });
});

/*
 * Administration code for Hubot
 */
app.get('/admin/:command/:token', function(req, res){
  var command = req.param("command");
  var token = req.param("token");
  if(token != app_config.token){
    res.send("NOPE.");
    return;
  }
  res.send("OK");
  switch(command){
    case "restart-vpn": restartVPN(); break;
    case "restart-servers": restartServers(); break;
    case "deploy": deployCode(); break;
    default: break;
  }
});

/*
 * Various functions to execute shell commands for
 * server management
 */
function restartVPN(){
  var command = 'vpnc-disconnect; sleep 5; vpnc dashboard.conf;';
  spawn('sh', ['-c', command], { stdio: 'inherit' });
}

function restartServers(){
  var command = 'forever restart index.js; sleep 5; forever restart monitor.js';
  spawn('sh', ['-c', command], { stdio: 'inherit' });
}

function deployCode(){
  var command = 'git pull origin master';
  spawn('sh', ['-c', command], { stdio: 'inherit' });
  setTimeout(restartServers, 5000);
}

//Setup HTTP & data fetchers
//--------------------------
http.listen(3000, function(){
  console.log("listening on 3000");
  var command = 'forever start monitor.js;';
  spawn('sh', ['-c', command], { stdio: 'inherit' });
});
