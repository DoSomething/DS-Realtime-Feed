var main = require('../index');
var app_config = main.app_config;

var request = require('superagent');

function getMembers(){
  request
  .get(app_config.memberCounterURL)
  .end(function(res) {
    var parsed = JSON.parse(res.text);
    var count = parsed.count;
    main.pushUserTotal(count);
  });
}

setInterval(getMembers, 2 * 1000);
