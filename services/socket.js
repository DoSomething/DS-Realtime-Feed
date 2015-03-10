/*
 * SocketIO service. Used for socket communication with the client.
 */

var io;
var callbacks = [];

module.exports = function(http){
  io = require('socket.io')(http);
  init();
}

/*
 * Called after SocketIO initilization.
 */
function init(){
  io.on('connection', function(socket) {
    notify();
  });
}

/*
 * Registers a callback with the service
 * Callbacks upon notification will be get passed the message & senders socket.
 *
 * @param Function callback
 */
function registerCallback(callback, prefix) {
  callbacks.push(callback);
}

/*
 * Broadcast a message to all clients.
 *
 * @param String prefix
 * @param String msg
 */
function broadcastMessage(prefix, msg) {
  io.emit(prefix, msg);
}

/*
 * Notifies all of the registered callbacks
 *
 * @param String data
 * @param Object socket
 */
function notify(data, socket) {
  callbacks.forEach(function(element, index, array) {
    element(data, socket);
  });
}
