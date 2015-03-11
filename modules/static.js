module.exports = function(router){

  router.get('/', function(req, res) {
    res.sendfile('index.html');
  });

}
