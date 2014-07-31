var mb_config = require(__dirname + '/config/mb_config.json');

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
          totalUsers++;
          io.emit('signup', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + '</p> created an account!</p>', {for: 'everyone'});
          break;
        case "campaign_signup" :
          io.emit('campaign', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + "</p> signed up for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>", {for: 'everyone'});
          break;
        case "campaign_reportback":
          io.emit('report back', '<p><p class="name">' + serializedMessage.merge_vars.FNAME + " </p> reported back for " + serializedMessage.merge_vars.CAMPAIGN_TITLE + "!</p>", {for: 'everyone'});
          io.emit('report back image', serializedMessage.merge_vars.REPORTBACK_IMAGE_MARKUP, {for: 'everyone'});
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