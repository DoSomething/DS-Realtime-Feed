var callbacks = [];

module.exports = function(router) {

  var message_broker = {};

  router.post('/', function(req, res) {
    notify("");
  });

  message_broker.registerCallback = function(callback) {
    callbacks.push(callback);
  }

  return message_broker;

}

function notify(data) {
  callbacks.forEach(function(element, index, array) {
    element(data);
  });
}
