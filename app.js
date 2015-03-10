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
this.app_config = require(__dirname + '/config/app_config.json');

console.log("Loading global modules...");
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

console.log("Loading services...");
var service_drupal = require(__dirname + '/services/drupal.js');
var service_google = require(__dirname + '/services/google.js');
var service_message_broker = require(__dirname + '/services/message_broker.js');
var service_socekt = require(__dirname + '/services/socket.js');
var service_mobile_commons = require(__dirname + '/services/mobile_commons.js');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//Setup HTTP & data fetchers
var PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log("listening on " + PORT);
});
