var express = require('express');
var app = express();
var http = require('http').Server(app);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

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

app.get('/', function(req, res){
  res.render('app', {production: process.env.PRODUCTION});
});

var PORT = process.env.PORT || 5000;
http.listen(PORT, function(){
  console.log(`Listening on ${PORT}`);
});
