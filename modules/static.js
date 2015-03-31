module.exports = function(app, router){

  router.get('/', function(req, res) {
    res.sendfile('index.html');
  });

}
