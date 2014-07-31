//[][][] [][][] [][][] [][][] []   [] [][][] [][][] []    []
//[]  [] []       []     []   []   []   []     []    []  []
//[][][] []       []     []    [] []    []     []      []
//[]  [] []       []     []    [] []    []     []      []
//[]  [] [][][]   []   [][][]    []   [][][]   []      []

//[][][] [][][] [][][] [][]
//[]     []     []     []  []
//[][]   [][]   [][]   []  []
//[]     []     []     []  []
//[]     [][][] [][][] [][]

//get it? its made of boxes, like our activity feed. ba-zing.

var countFile = require(__dirname + '/count.json');

var fs = require("fs");
var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('superagent');
var amqp = require('amqp');
var parseString = require('xml2js').parseString;
var PHPUnserialize = require('php-unserialize');

var totalUsers = countFile.total;

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('index.html');
});

//Date functions
Date.prototype.subHours = function(h) {
   this.setTime(this.getTime() - (h*60*60*1000));
   return this;
}

Date.prototype.subMinutes = function(m) {
    this.setTime(this.getTime() - (m*60000));
    return this;
}

Date.prototype.daysBetween = function(date1, date2) {
  var one_day=1000*60*60*24;
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();
  var difference_ms = date2_ms - date1_ms;
  return Math.round(difference_ms/one_day);
}

//SocketIO
//--------
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
this.pushUserTotal = function (){
  io.emit('ticker', totalUsers, {for: 'everyone'});
}

/*
 * Returns all of the events in our Google Cal. ordered by start time in
 * JSON format.
 */
app.get('/events', function(req, res) {
  //! replace with module
});

/*
 * Gets all the current staff pick campaigns and returns in JSON format
 */
app.get('/staff-picks', function(req, res){
  //! replace with module
});

//Setup HTTP & data fetchers
//--------------------------
http.listen(3000, function(){
  getMessages(1);
  console.log("listening on 3000");
});
