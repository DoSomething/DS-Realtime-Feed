var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

var cors = require('cors');

var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: {
    isTrue: function(v) {
      return v === true;
    }
  }
}));
app.set('view engine', 'handlebars');

var sassMiddleWare = require('node-sass-middleware');
app.use(
  sassMiddleWare({
    src: __dirname + '/sass',
    dest: __dirname + '/public',
    outputStyle: 'compressed',
    debug: true
  })
);
app.use(express.static(`${__dirname}/public`));
app.use(express.static(`${__dirname}/node_modules/@dosomething/forge/dist`));
app.use(express.static(`${__dirname}/node_modules/@dosomething/forge/assets`));

var drupal = require(`${__dirname}/drupal`);

var notifications = require(`${__dirname}/notifications`);
notifications.configureSocket(io);
if (process.env.PRODUCTION == "FALSE") {
  // If dev mode, make fake event every 5 seconds
  setInterval(notifications.fakeNotification, 5 * 1000);

  // If dev mode, make fake visits every 2 seconds
  setInterval(function() {
    io.emit('visit', {code: "US"});
  }, 2 * 1000);
}

var reportbacks = require(`${__dirname}/reportbacks`);
reportbacks.getReportbacks();

app.get('/', function(req, res){
  res.render('app', {production: process.env.PRODUCTION});
});

app.get('/stats/members', function(req, res) {
  drupal.post('users/get_member_count', {}, function(data) {
    if (!data.formatted) {
      res.send("Error");
      return;
    }

    res.send(data.readable);
  });
});

app.get('/reportbacks', function(req, res) {
  res.json(reportbacks.fetch())
});

app.get('/notifications/recent', function(req, res) {
  res.json(notifications.fetch());
});

// Legacy URL's that Message Broker & Drupal push too
app.post('/services/message-broker', function(req, res) {
  var notif = notifications.parseMessageBroker(req.body);
  res.json(["OKAY", 200]);
});

app.post('/services/drupal', cors(), function(req, res) {
  io.emit('visit', req.body);
  res.json(["OKAY", 200]);
});

var PORT = process.env.PORT || 5000;
http.listen(PORT, function(){
  console.log(`Listening on ${PORT}`);
});
