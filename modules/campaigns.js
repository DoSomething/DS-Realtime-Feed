module.exports = function(app, router){

  router.get('/random-campaigns', function(req, res) {
    app.service_drupal.get('campaigns.json?parameters[is_staff_pick]=1', {}, function(campaignListRes) {
      var campaigns = [];
      for(var i = 0; i < 2; i++) {
        campaigns.push(buildCampaignData(campaignListRes.data.splice(getRandomInt(0, campaignListRes.data.length - 1), 1)[0]));
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
  if(rawData.cover_image == undefined){
    imgUrl = '/img/logo.png';
    console.log("Broken Campaign Image? " + rawData.title);
  }
  else{
    imgUrl = rawData.cover_image.default.uri;
  }
  var campaignData = {
    title: rawData.title,
    image: imgUrl,
    nid: rawData.id,
    staffpick: rawData.is_staff_pick
  };
  return campaignData;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
