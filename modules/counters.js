var QUERY_TOTAL_USERS = "select total from overall.total";

var request = require('superagent');

module.exports = function(app, router){

  router.get('/ctl', function(req, res) {
    request
     .get("http://crisistextline.org/trends/data/messages.txt")
     .end(function(response){
        var total = response.text;
        res.json({total: total});
     });
  });

  router.get('/dosomething', function(req, res) {
    app.service_drupal.post('users/v1/get_member_count', {}, function(drupalRes) {
      console.log(drupalRes);
      res.json(drupalRes);
    });
  });

}
