module.exports = function(app, router){

  app.service_message_broker.registerCallback(function(mb_data) {
    console.log(mb_data);
    var data = {
      activity: mb_data['activity'],
      name: mb_data['merge_vars']['FNAME'],
    }
    if(data.activity != "user_register") {
      data['campaign'] = mb_data['merge_vars']['CAMPAIGN_TITLE'];
    }
    app.service_socket.broadcastMessage('event', data);
  });

  app.service_drupal_events.registerCallback(function(data) {
    app.service_socket.broadcastMessage('web-visit', data);
  });

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
      app.service_stathat.trackCount('undefined_mobile_commons', 1);
      return;
    }
    messages.forEach(function(element, index, array) {
      if(element.profile[1] == undefined) {
        return;
      }
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
