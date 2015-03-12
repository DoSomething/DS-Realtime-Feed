module.exports = function(app, router){

  router.get('/', function(req, res) {
    app.service_drupal.get('campaigns.json?parameters[is_staff_pick]=1', {}, function(campaignListRes) {
      var randomCampaign = campaignListRes[getRandomInt(campaignListRes.length - 1, 0)];
      app.service_drupal.get('content/' + randomCampaign.nid, {}, function(campaignRes) {
        var campaignData = {
          title: campaignRes.title,
          image: campaignRes.image_cover.url.square.raw,
          signups: campaignRes.stats.signups
        };
        res.json(JSON.stringify(campaignData));
      });
    });
  });
  
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
