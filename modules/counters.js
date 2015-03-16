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
    //@TODO
  });

}
