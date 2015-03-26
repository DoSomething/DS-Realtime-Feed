var stathat = require('node-stathat');

this.trackCount = function(type, value) {
  stathat.trackEZCount(process.env.STATHAT_EMAIL, "dsrealtime-feed-" + type, value, function(status, json) {
    if(process.env.DEV_MODE){
      console.log("StatHat: " + status + " -- " + json);
    }
  });
}

this.trackValue = function(type, value) {
  stathat.trackEZCount(process.env.STATHAT_EMAIL, "dsrealtime-feed-" + type, value, function(status, json) {
    if(process.env.DEV_MODE){
      console.log("StatHat: " + status + " -- " + json);
    }
  });
}
