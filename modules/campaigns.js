module.exports = function(app, router){

  router.get('/random-campaigns', function(req, res) {
    app.service_drupal.get('campaigns.json?parameters[is_staff_pick]=1', {}, function(campaignListRes) {
      var campaigns = [];
      for(var i = 0; i < 2; i++) {
        campaigns.push(campaignListRes.data.splice(getRandomInt(0, campaignListRes.data.length - 1), 1)[0]);
      }
      res.json(campaigns);
    });
  });

  router.get('/reportbacks/:nid', function(req, res) {
    var nid = req.params.nid;
    app.service_drupal.get('campaigns/' + nid + '/gallery', {}, function(reportbackRes) {
      res.json(reportbackRes);
    });
  });

}

function buildCampaignData(rawData) {
  var imgUrl;
  if(randomCampaign.cover_image == undefined){
    imgUrl = '/img/logo.png';
    console.log("Broken Campaign Image? " + campaignRes.title);
    app.service_stathat.trackCount('broken_image', 1);
  }
  else{
    imgUrl = randomCampaign.cover_image.default.uri;
  }
  var campaignData = {
    title: randomCampaign.title,
    image: imgUrl,
    nid: randomCampaign.id,
    staffpick: randomCampaign.is_staff_pick
  };
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
