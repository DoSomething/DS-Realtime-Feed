/*
 * Mobile Commons service. Handles all mobile commons requests.
 */

var parseString = require('xml2js').parseString;
var request = require('superagent');

var BASE_URL = 'https://secure.mcommons.com/api/';
var API_USERNAME = process.env.MOBILE_COMMONS_USERNAME;
var API_PASSWORD = process.env.MOBILE_COMMONS_PASSWORD;

/*
 * GET from the Mobile Commons API with the specified URL & data, use authentication.
 * Sends the response body back in callback.
 *
 * @param String url
 * @param Object data
 * @param Function callback
 */
this.authGet = function(url, data, callback) {
  request
    .get(BASE_URL + url)
    .auth(API_USERNAME, API_PASSWORD)
    .query(data)
    .buffer()
    .accept('xml')
    .type('xml')
    .end(function(res){
      parseString(res.text, function (err, result) {
        callback(result);
      });
    });
}
