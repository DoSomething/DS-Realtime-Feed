var amqp = require('amqp');
var PHPUnserialize = require('php-unserialize');
var main = require('../index');

var app_config = main.app_config;

/*
 * Create a amap connection with config settings
 */
var conn = amqp.createConnection({
  host: app_config.message_broker.host,
  port: app_config.message_broker.port,
  login: app_config.message_broker.login,
  password: app_config.message_broker.password,
  connectionTimeout: app_config.message_broker.connectionTimeout,
  authMechanism: app_config.message_broker.authMechanism,
  vhost: app_config.message_broker.vhost,
  noDelay: app_config.message_broker.noDelay,
  ssl: { enabled : app_config.message_broker.ssl_enabled }
},
{
  defaultExchangeName: app_config.message_broker.defaultExchangeName
});

/*
 * Connect to queue & build HTML elements based off the data, push results
 * over SocketIO to clients
 */
conn.on('ready', function(){
  console.log('rabbit connection ready');
  var q = conn.queue('activityStatsQueue', {
    passive: app_config.message_broker.passive,
    durable: app_config.message_broker.durable,
    exclusive: app_config.message_broker.exclusive,
    autoDelete: app_config.message_broker.autoDelete
  }, function (q) {
    console.log('Queue ' + q.name + ' is open');

    q.bind('#');

    q.subscribe(function (message) {
      var serializedMessage = PHPUnserialize.unserialize(message.data.toString());
      var activity = serializedMessage.activity;
      switch(activity){
        case "user_register":
          break;
        case "campaign_signup" :
          main.sendActivityMessage('campaign', serializedMessage.merge_vars.FNAME + " signed up for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!");
          break;
        case "campaign_reportback":
          var name = serializedMessage.merge_vars.FNAME == "" ? "Another Do-er" :  serializedMessage.merge_vars.FNAME;
          main.sendActivityMessage('report back', name + " reported back for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!");
          var regex = /<img.*?src="(.*?)"/;
          var src = regex.exec(serializedMessage.merge_vars.REPORTBACK_IMAGE_MARKUP)[1];
          main.sendActivityMessage('report back image', src);
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
