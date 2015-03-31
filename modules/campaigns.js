module.exports = function(app, router){

  router.get('/staff-pick', function(req, res) {
    app.service_drupal.get('campaigns.json?parameters[is_staff_pick]=1', {}, function(campaignListRes) {
      var randomCampaign = campaignListRes[getRandomInt(0, campaignListRes.length - 1)];
      app.service_drupal.get('content/' + randomCampaign.nid, {}, function(campaignRes) {
        var imgUrl;
        if(campaignRes.image_cover == undefined){
          imgUrl = '/img/logo.png';
          console.log("Broken Campaign Image? " + campaignRes.title);
          app.service_stathat.trackCount('broken_image', 1);
        }
        else{
          imgUrl = campaignRes.image_cover.src
        }
        var campaignData = {
          title: campaignRes.title,
          image: imgUrl,
          signups: campaignRes.stats.signups,
          nid: campaignRes.nid
        };
        res.json(campaignData);
      });
    });
  });

  router.get('/reportbacks/:nid', function(req, res) {
    var nid = req.params.nid;
    app.service_drupal.get('campaigns/' + nid + '/gallery', {}, function(reportbackRes) {
      res.json(reportbackRes);
    });
  });

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
