var callbacks = [];

module.exports = function(router) {

  var social = {};

  router.post('/', function(req, res) {
    notify(req.body);
    res.json(["OKAY", 200]);
  });

  social.registerCallback = function(callback) {
    callbacks.push(callback);
  }

  return social;
}

function notify(data) {
  callbacks.forEach(function(element, index, array) {
    element(data);
  });
}
