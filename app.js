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

console.log("Loading internal modules...");
var router_static = express.Router();
app.use('/module/static', router_static);
this.module_static = require(__dirname + '/modules/static')(this, router_static);

app.get('/', function(req, res){
  res.redirect('/module/static');
});

//Setup HTTP & data fetchers
var PORT = process.env.PORT || 3000;
http.listen(PORT, function(){
  console.log("Listening on " + PORT);
});
