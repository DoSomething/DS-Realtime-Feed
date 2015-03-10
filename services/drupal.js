var request = require('superagent');

var BASE_URL = "https://dosomething.org";
var API_VERSION = "/api/v1/";
var API_USERNAME = process.env.DRUPAL_USERNAME;
var API_PASSWORD = process.env.DRUPAL_PASSWORD;

/*
 * GET from the Drupal API with the specified URL & data, use admin authentication.
 * Sends the response body back in callback.
 *
 * @param String url
 * @param Object data
 * @param Function callback
 */
function authGet(url, data, callback) {
	request
	 .post(BASE_URL + API_VERSION + "/auth/login")
	 .set('Content-Type', 'application/json')
	 .set('Accept', 'application/json')
	 .send({"username": API_USERNAME, "password": API_PASSWORD})
	 .end(function(res){
  	  var raw = res.body;
  	 	drupalToken = raw.token;
  	 	drupalSessid = raw.sessid;
  	 	drupalSessionName = raw.session_name;
    	request
        .get(BASE_URL + API_VERSION + url)
        .set('Accept', 'application/json')
        .set("Content-type", "application/json")
        .set("X-CSRF-Token", drupalToken)
        .set("Cookie", drupalSessionName + "=" + drupalSessid)
        .send(data)
        .end(function(res){
          callback(res.body);
        });
   });
}

/*
 * POST from the Drupal API with the specified URL & data, use admin authentication.
 * Sends the response body back in callback.
 *
 * @param String url
 * @param Object data
 * @param Function callback
 */
function authPost(url, data, callback) {
  request
   .post(BASE_URL + API_VERSION + "/auth/login")
   .set('Content-Type', 'application/json')
   .set('Accept', 'application/json')
   .send({"username": API_USERNAME, "password": API_PASSWORD})
   .end(function(res){
      var raw = res.body;
      drupalToken = raw.token;
      drupalSessid = raw.sessid;
      drupalSessionName = raw.session_name;
      request
        .post(BASE_URL + API_VERSION + url)
        .set('Accept', 'application/json')
        .set("Content-type", "application/json")
        .set("X-CSRF-Token", drupalToken)
        .set("Cookie", drupalSessionName + "=" + drupalSessid)
        .send(data)
        .end(function(res){
          callback(res.body);
        });
   });
}

/*
 * GET from the Drupal API with the specified URL & data.
 * Sends the response body back in callback.
 *
 * @param String url
 * @param Object data
 * @param Function callback
 */
function get(url, data, callback) {
  request
    .get(BASE_URL + API_VERSION + url)
    .set('Accept', 'application/json')
    .set("Content-type", "application/json")
    .set("X-CSRF-Token", drupalToken)
    .set("Cookie", drupalSessionName + "=" + drupalSessid)
    .send(data)
    .end(function(res){
      callback(res.body);
    });
}

/*
 * POST from the Drupal API with the specified URL & data.
 * Sends the response body back in callback.
 *
 * @param String url
 * @param Object data
 * @param Function callback
 */
function post(url, data, callback) {
  request
    .post(BASE_URL + API_VERSION + url)
    .set('Accept', 'application/json')
    .set("Content-type", "application/json")
    .set("X-CSRF-Token", drupalToken)
    .set("Cookie", drupalSessionName + "=" + drupalSessid)
    .send(data)
    .end(function(res){
      callback(res.body);
    });
}
