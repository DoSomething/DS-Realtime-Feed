$(document).on('ready', function() {
  var globe = GlobeInit();

  var socket = io.connect(location.host);
  socket.on('visit', function(data) {
    if (!data.code) {
      return;
    }
    globe.handleWebVisit(data.code);
  });
});
