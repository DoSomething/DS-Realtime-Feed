var tweetData = {};

module.exports = function(app, router){
  app.service_social.registerCallback(function(twitterData) {
    tweetData = twitterData;
  });

  router.get('/', function(req, res) {
    res.json(tweetData);
  });
}
