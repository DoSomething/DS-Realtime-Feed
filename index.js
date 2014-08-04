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

this.gc_config = require(__dirname + '/config/gc_config.json');
this.mc_config = require(__dirname + '/config/mc_config.json');
this.mb_config = require(__dirname + '/config/mb_config.json');

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

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

//Setup HTTP & data fetchers
//--------------------------
http.listen(3000, function(){
  console.log("listening on 3000");
});
