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

console.log("Loading global modules...");
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var sassMiddleWare = require('node-sass-middleware');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(
  sassMiddleWare({
    src: __dirname + '/sass',
    dest: __dirname + '/public',
    outputStyle: 'compressed',
    debug: true
  })
);
app.use(express.static(__dirname + '/public'));

console.log("Loading services...");
this.service_drupal = require(__dirname + '/services/drupal');
var router_message_broker = express.Router();
app.use('/services/message_broker', router_message_broker);
this.service_message_broker = require(__dirname + '/services/message-broker')(router_message_broker);
this.service_socket = require(__dirname + '/services/socket')(http);
this.service_mobile_commons = require(__dirname + '/services/mobile_commons');
this.service_stathat = require(__dirname + '/services/stathat');

console.log("Loading internal modules...");
var router_static = express.Router();
app.use('/module/static', router_static);
this.module_static = require(__dirname + '/modules/static')(this, router_static);

var router_counter = express.Router();
app.use('/module/counters', router_counter);
this.module_counters = require(__dirname + '/modules/counters')(this, router_counter);

var router_events = express.Router();
app.use('/module/events', router_events);
this.module_events = require(__dirname + '/modules/events')(this, router_events);

var router_campaigns = express.Router();
app.use('/module/campaigns', router_campaigns);
this.module_campaigns = require(__dirname + '/modules/campaigns')(this, router_campaigns);

app.get('/', function(req, res){
  res.redirect('/module/static');
});

//Setup HTTP & data fetchers
var PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log("Listening on " + PORT);
});
