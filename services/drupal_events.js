var callbacks = [];
var cors = require('cors');

module.exports = function(router) {

  var events = {};

  router.post('/', cors(), function(req, res) {
    notify(req.body);
    res.json(["OKAY", 200]);
  });

  events.registerCallback = function(callback) {
    callbacks.push(callback);
  }

  return events;
}

function notify(data) {
  callbacks.forEach(function(element, index, array) {
    element(data);
  });
}
