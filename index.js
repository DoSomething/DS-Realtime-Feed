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

this.app_config = require(__dirname + '/config/app_config.json');
var app_config = this.app_config;

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var spawn = require('child_process').spawn;
var stathat = require('node-stathat');

var googleCalHandler = require(__dirname + '/handlers/GoogleCalHandler');
var campaignHandler = require(__dirname + '/handlers/CampaignHandler');
var messageBrokerHandler = require(__dirname + '/handlers/MessageBrokerHandler');
var mobileCommonsHandler = require(__dirname + '/handlers/MobileCommonsHandler');
var userCountHandler = require(__dirname + '/handlers/UserCountHandler');

var localMemberCount = 2,911,538;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

io.on('connection', function(socket) {
  stathat.trackEZCount(app_config.stathat.stathat_email, "dsrealtimefeed - connect", 1, function(status, json) {});
  console.log("Client connected");
  socket.emit('ticker', localMemberCount);
});

/*
 * Sends an activity message to all connected clients
 */
this.sendActivityMessage = function (type, message){
  stathat.trackEZCount(app_config.stathat.stathat_email, "dsrealtimefeed - message", 1, function(status, json) {});
  io.emit(type, message);
}

/*
 * Pushes the current user total to the client ticker
 */
this.pushUserTotal = function (total){
  localMemberCount = total;
  io.emit('ticker', localMemberCount);
}

this.pushCampaigns = function(results){
  io.emit('campaigns', results);
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
    console.log(token);
    res.send("NOPE.");
    return;
  }
  switch(command){
    case "restart-vpn":
      restartVPN(res);
      break;
    case "restart-servers":
      restartServers(res);
      break;
    case "deploy":
      deployCode(res);
      break;
    case "restart-clients":
      reloadClients(res);
      break;
    default:
      res.send("Hm, you told me to do " + command + " but I have no idea what that means.");
      break;
  }
});

/*
 * Various functions to execute shell commands for
 * server management
 */

var vpnCommand = 'vpnc-disconnect; sleep 5; vpnc dashboard.conf;';
var restartCommand = 'forever restart index.js; sleep 5; forever restart monitor.js';
var deployCommand = 'git pull origin master';

function restartVPN(res){
  spawn('sh', ['-c', vpnCommand], { stdio: 'inherit' }).on('exit', function(code){
    res.send("VPN has been restarted");
  });
}

function restartServers(res){
  spawn('sh', ['-c', restartCommand], { stdio: 'inherit' }).on('exit', function(code){
    res.send("Sever has been restarted");
  });
}

function deployCode(res){
  spawn('sh', ['-c', deployCommand], { stdio: 'inherit' }).on('exit', function(code){
    spawn('sh', ['-c', restartCommand], { stdio: 'inherit' }).on('exit', function(code){
      stathat.trackEZCount(app_config.stathat.stathat_email, "dsrealtimefeed - deploy", 1, function(status, json) {});
      res.send("Code has been deployed and servers have restarted!");
    });
  });
}

function reloadClients(res){
  io.emit('reload', "", {for: 'everyone'});
  res.send("Clients have been told to reload");
}

//Setup HTTP & data fetchers
//--------------------------
http.listen(3000, function(){
  console.log("listening on 3000");
  var command = 'forever stop monitor.js; sleep 5; forever start monitor.js';
  spawn('sh', ['-c', command], { stdio: 'inherit' });
});
