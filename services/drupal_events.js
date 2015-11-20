var callbacks = [];

module.exports = function(router) {

  var events = {};

  router.post('/', function(req, res) {
    console.log("hi");
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
