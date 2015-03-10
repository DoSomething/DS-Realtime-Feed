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

this.app_config = require(__dirname + '/config/app_config.json');

var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//Setup HTTP & data fetchers
var PORT = process.env.PORT || 3000;
//--------------------------
http.listen(PORT, function(){
  console.log("listening on " + PORT);
});
