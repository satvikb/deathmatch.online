var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8000;

var server = require('http').createServer(app)
var fs = require('fs')

var util = require("util")
var socket = require("socket.io").listen(server, {origins:'localhost:8000:*'})

function init(){
  setEventHandlers();

  server.listen(port);
}

var setEventHandlers = function() {
  socket.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
  util.log("Client has connected: "+client.id);
};

init();
