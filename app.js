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

// Get it? It's made of boxes, just like our feed.

console.log("Loading config...");
//need to redo this, use ENV files and put them in a diff. private repo -- use forman to start the app, solves everything

console.log("Loading global modules...");
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

console.log("Loading services...");
this.service_drupal = require(__dirname + '/services/drupal.js');
this.service_message_broker = require(__dirname + '/services/message_broker.js');
this.service_socekt = require(__dirname + '/services/socket.js')(http);
this.service_mobile_commons = require(__dirname + '/services/mobile_commons.js');
this.service_data = require(__dirname + '/services/data.js');

console.log("Loading internal modules...");
this.module_static = require(__dirname + '/modules/static.js');
this.module_counters = require(__dirname + '/modules/counters.js');
this.module_events = require(__dirname + '/modules/events.js');
this.module_campaigns = require(__dirname + '/modules/campaigns.js');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//Setup HTTP & data fetchers
var PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log("Listening on " + PORT);
});
