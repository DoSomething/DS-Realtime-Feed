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
app.use(express.static(`${__dirname}/public`));

app.get('/', function(req, res){
  res.sendFile(`${__dirname}/index.html`);
});

var PORT = process.env.PORT || 5000;
http.listen(PORT, function(){
  console.log(`Listening on ${PORT}`);
});
