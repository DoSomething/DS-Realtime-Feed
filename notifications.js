var cheerio = require('cheerio');
var drupal = require(`${__dirname}/drupal`);
var io = undefined;

var notifications = [];

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

exports.fetch = function(amount) {
  if (!amount) {
    amount = 5;
  }
  return notifications.slice(0, amount);
}

function broadcastNotification(notification) {
  if (io == undefined) {
    return;
  }

  io.emit('notification', notification);
}

function addNotification(notification) {
  notifications.push(notification);

  if (notifications.length > 5) {
    notifications.shift();
  }

  broadcastNotification(notification);
}

function buildNotification(name, type, photo, action) {
  var notification = {
    id: getRandomArbitrary(1, 100000),
    name: name,
    photo: photo,
    action: action,
    type: type
  }

  addNotification(notification);
  return addNotification;
}

exports.parseMessageBroker = function(data) {
  var name = data['merge_vars']['FNAME'];
  var type = data['activity'];
  var photo = "/images/logo.svg";
  var action = "";

  switch (type) {
    case 'user_register':
      action = "Created an account"
      buildNotification(name, type, photo, action);
      break;
    case 'campaign_reportback':
      campaign = data['merge_vars']['CAMPAIGN_TITLE'];
      $ = cheerio.load(data['merge_vars']['REPORTBACK_IMAGE_MARKUP']);
      photo = $('img').attr('src');
      action = `Reported back for ${campaign}`;
      buildNotification(name, type, photo, action);
      break;
    case 'campaign_signup':
      campaign = data['merge_vars']['CAMPAIGN_TITLE'];
      action = `Signed up for ${campaign}`;
      drupal.get(`campaigns/${data['event_id']}`, {}, function(data) {
        if (!data.data) {
          photo = "/images/logo.svg";
        }
        else {
          photo = data.data.cover_image.default.sizes.landscape.uri;
        }
        buildNotification(name, type, photo, action);
      });
      break;
  }
}

exports.fakeNotification = function() {
  var signup = Math.random() > 0.5;
  return buildNotification(
    "Puppet Sloth",
    signup ? "campaign_signup" : "campaign_reportback",
    "https://placekitten.com/300/300",
    signup ? "Signed up for Thumb Wars" : "Reported back for Thumb Wars"
  );
}

exports.configureSocket = function(_io) {
  io = _io;
}
