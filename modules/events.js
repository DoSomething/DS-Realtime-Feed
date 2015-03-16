module.exports = function(app, router){
  getMobileData(app);
  setTimeout(function(){
    getMobileData(app);
  }, 60 * 1000);
}

function getMobileData(app){
  var now = new Date();
  var minAgo = new Date().subMinutes(1);
  mobileCommonsParams = {
    include_profile: true,
    start_time: minAgo.toISOString(),
    end_time: now.toISOString(),
    limit: '1000'
  };
  app.service_mobile_commons.authGet('messages', mobileCommonsParams, function(response) {
    var messages = response.response.messages[0].message;
    if(messages == undefined){
      return;
    }
    messages.forEach(function(element, index, array) {
      var firstName = element.profile[1].first_name;
      if(firstName != ''){
        app.service_socket.broadcastMessage("events_mobile", firstName);
      }
    });
  });
}

Date.prototype.subMinutes = function(m) {
    this.setTime(this.getTime() - (m*60000));
    return this;
}
