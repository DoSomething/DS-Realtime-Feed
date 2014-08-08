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
          main.sendActivityMessage('signup', serializedMessage.merge_vars.FNAME);
          break;
        case "campaign_signup" :
          main.sendActivityMessage('campaign', serializedMessage.merge_vars.FNAME + ":" + serializedMessage.merge_vars.CAMPAIGN_TITLE);
          break;
        case "campaign_reportback":
          var name = serializedMessage.merge_vars.FNAME == "" ? "Another Do-er" :  serializedMessage.merge_vars.FNAME;
          main.sendActivityMessage('report back', name + ":" + serializedMessage.merge_vars.CAMPAIGN_TITLE);
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
