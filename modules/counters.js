var request = require('superagent');

module.exports = function(app, router){

  router.get('/dosomething', function(req, res) {
    app.service_drupal.post('users/get_member_count', {}, function(drupalRes) {
      res.json(drupalRes.formatted);
    });
  });

}
