var request = require('superagent');

var url = "http://beta.dosomething.org/api/v1/content/2401.json";

/*
 * title      The title of the campaign
 * imageURL   The link to the square high-res campaign photo
 * signups    The total web signup count
 * daysLeft   The total days left in the campaign
 */
var Camp = function(title, imageURL, signups, daysLeft){
  this.title = title;
  this.imageURL = imageURL;
  this.signups = signups;
  this.daysLeft = daysLeft;
}

/*
 * Builds Camp objects out of the current staff picks and returns an array
 */
this.getCampaigns = function(callback){
  var campaigns = [];
  request
    .get(url)
    .type('application/json')
    .accept('application/json')
    .end(function(dRes){
      var response = JSON.parse(dRes.text);
      var date = new Date();
      var daysLeft = date.daysBetween(date, new Date(response.high_season_end));
      var responseCamp = new Camp(response.title, response.image_cover.url.square.raw, response.stats.signups, daysLeft);
      campaigns.push(responseCamp);
      callback(JSON.stringify(campaigns));
    });
}
