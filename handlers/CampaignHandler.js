var request = require('superagent');
var main = require('../index');

var contentUrl = "http://beta.dosomething.org/api/v1/content/";
var listUrl = "http://beta.dosomething.org/api/v1/campaigns.json?parameters[is_staff_pick]=1";

var campaigns = [];

Date.prototype.daysBetween = function(date1, date2) {
  var one_day= 1000 * 60 * 60 * 24;
  var date1_ms = date1.getTime();
  var date2_ms = date2.getTime();
  var difference_ms = date2_ms - date1_ms;
  return Math.round(difference_ms/one_day);
}

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
function getCampaigns(){
  getIds(function(ids){
    getCampaignData(0, ids, function(campaignResults){
      main.pushCampaigns(campaignResults);
      campaigns = [];
      setTimeout(getCampaigns, 1000);
    });
  });
}

function getIds(callback){
  var ids = [];
  request
    .get(listUrl)
    .type('application/json')
    .accept('application/json')
    .end(function(res){
      var list = JSON.parse(res.text);
      for(var index = 0; index < list.length; index++){
        ids.push(list[index].nid);
      }
      callback(ids);
    });
}

function getCampaignData(index, ids, callback){
  if(index > ids.length){
    callback(JSON.stringify(campaigns));
    return;
  }
  request
    .get(contentUrl + ids[index] + ".json")
    .type('application/json')
    .accept('application/json')
    .end(function(res){
      var response = JSON.parse(res.text);

      //For staging (temp)
      if(response[0] == false){
        nextCampaign(index, ids, callback);
        return;
      }
      if(response.image_cover == undefined){
        nextCampaign(index, ids, callback);
        return;
      }

      var date = new Date();
      var daysLeft = date.daysBetween(date, new Date(response.high_season_end));
      if(daysLeft <= 0){
        nextCampaign(index, ids, callback);
        return;
      }
      var responseCamp = new Camp(response.title, response.image_cover.url.square.raw, response.stats.signups, daysLeft);
      campaigns.push(responseCamp);
      nextCampaign(index, ids, callback);
    });
}

function nextCampaign(index, ids, callback){
  var newIn = index + 1;
  getCampaignData(newIn, ids, callback);
}

getCampaigns();
