var amqp = require('amqp');
var PHPUnserialize = require('php-unserialize');

var userCounter = require('./UserCountHandler');
var main = require('../index');

var mb_config = main.mb_config;

/*
 * Create a amap connection with config settings
 */
var conn = amqp.createConnection({
  host: mb_config.host,
  port: mb_config.port,
  login: mb_config.login,
  password: mb_config.password,
  connectionTimeout: mb_config.connectionTimeout,
  authMechanism: mb_config.authMechanism,
  vhost: mb_config.vhost,
  noDelay: mb_config.noDelay,
  ssl: { enabled : mb_config.ssl_enabled }
},
{
  defaultExchangeName: mb_config.defaultExchangeName
});

/*
 * Connect to queue & build HTML elements based off the data, push results
 * over SocketIO to clients
 */
conn.on('ready', function(){
  console.log('rabbit connection ready');
  var q = conn.queue('activityStatsQueue', {
    passive: mb_config.passive,
    durable: mb_config.durable,
    exclusive: mb_config.exclusive,
    autoDelete: mb_config.autoDelete
  }, function (q) {
    console.log('Queue ' + q.name + ' is open');

    q.bind('#');

    q.subscribe(function (message) {
      var serializedMessage = PHPUnserialize.unserialize(message.data.toString());
      var activity = serializedMessage.activity;
      switch(activity){
        case "user_register":
          userCounter.increaseMemberCount();
          main.sendActivityMessage('signup', '<p class="name">' + serializedMessage.merge_vars.FNAME + '</p> <p> created an account!</p>');
          break;
        case "campaign_signup" :
          main.sendActivityMessage('campaign', '<p class="name">' + serializedMessage.merge_vars.FNAME + "</p> <p> signed up for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>");
          break;
        case "campaign_reportback":
          var name = serializedMessage.merge_vars.FNAME == "" ? "Another Do-er" :  serializedMessage.merge_vars.FNAME;
          main.sendActivityMessage('report back', '<p><span class="name">' + name + " </span> reported back for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>");
          var regex = /<img.*?src="(.*?)"/;
          var src = regex.exec(serializedMessage.merge_vars.REPORTBACK_IMAGE_MARKUP)[1];
          var newImage = '<img class="lazy" data-original="' + src + '" src="/img/loader.svg" />';
          main.sendActivityMessage('report back image', newImage);
          break;
        case "campaign_group_signup":
          break;
        case "user_password":
          break;
        default:
          break;
      }
    });

  });
});
