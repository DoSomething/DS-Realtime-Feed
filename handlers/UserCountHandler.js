var countFile = require(__dirname + '/count.json');

var main = require('./index');
var fs = require("fs");
var request = require('superagent');

var totalUsers = countFile.total;

/*
 * Function for replacing in a string
 */
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

/*
 * Grabs the total users from the Data dashboard and returns it in a callback
 */
function calculateTotalUsers(callback){
  var url = "http://dashboards.dosomething.org/";
  var total = 0;
  request
    .get(url)
    .end(function(res) {
      var pageHTML = res.text;
      var $ = cheerio.load(pageHTML);
      var data = $('#total_member_count').text().replace("CURRENT MEMBERS: ", "");
      var num = parseInt(replaceAll(',', '', data));
      callback(num);
  });
}

/*
 * Gets the remote total and determines if we should use our local count or the
 * remote count. Also saves our current count to file.
 */
function processUsers(){
  calculateTotalUsers(function(remoteTotal){
    if(remoteTotal > totalUsers){
      totalUsers = remoteTotal;
    }
    countFile.total = totalUsers;
    fs.writeFile("count.json", JSON.stringify(countFile));
    pushUserTotal(totalUsers);
  });
}

setInterval(processUsers, 5 * 1000);
