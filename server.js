var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8000;

var server = require('http').createServer(app)
var fs = require('fs')

var util = require("util")
var io = require("socket.io").listen(server, {origins:'localhost:8000:*'})

var p2 = require('p2')

var rooms = [new Room("test")]

function init(){
  setEventHandlers();

  server.listen(port);
}

var setEventHandlers = function() {
  io.sockets.on("connection", onSocketConnection);
};

function onSocketConnection(client) {
  util.log("Client has connected: "+client.id);

  client.on("joingame", function(data){
    //create player
    var player = new Player(client.id, getRandomInt(0, 1000), 300)
    var room = findOpenRoom()
    if(room){
      console.log("Joining to "+room.name )
      client.join(room.name)

      var playerData = {id: player.id, x: player.position.x, y: player.position.y}
      client.emit("joingame", playerData)

      //Tell everyone else in the room of the new player
      client.broadcast.to(room.name).emit("newplayer", playerData)
      //Tell the new player about existing players
      for(var i = 0; i < room.players.length; i++){
        var existingPlayer = room.players[i]
        var existingData = {id: existingPlayer.id, x: existingPlayer.position.x, y: existingPlayer.position.y}
        console.log("telling "+client.id+" about "+existingPlayer.id)
        client.emit("newplayer", existingData)
      }

      room.addPlayer(player)
    }

    //TODO Optimize
    client.on('input', function(data){
      // if(data.left){
      //   player.velocity += this.movespeed*
      // }
      player.inputs = data
      // updateControls(delta)
    })

    client.on("disconnect", function(){
      if(room){
        room.removePlayer(player)
        console.log("remove player "+client.id)
      }
    })
  })



};

var MAX_PER_ROOM = 10


//TODO Create new rooms based on new players
function findOpenRoom(){
  for(var i = 0; i < rooms.length; i++){
    // var room = io.sockets.adapter.rooms[rooms[i].name];
    // console.log("Room: "+room.length)
    // if(room.length < MAX_PER_ROOM){
      return rooms[i];
    // }
  }
  return null
}


var time = Date.now()
var delta;
function update(){
  delta = Date.now()-time

  updateControls(delta/1000)
  updatePhysics(delta/1000)

  sendUpdate()
  setTimeout(update, 1/30)//delta/1000)

  time = Date.now()
}

function updateControls(d){
  for(var r = 0; r < rooms.length; r++){
    var room = rooms[r];
    var roomUpdateData = {}

    for(var i = 0; i < room.players.length; i++){
      var player = room.players[i]
      player.applyInputs(d)
    }
  }
}

function sendUpdate(){
  for(var r = 0; r < rooms.length; r++){
    var room = rooms[r];
    var roomUpdateData = []

    for(var i = 0; i < room.players.length; i++){
      var player = room.players[i]
      var playerData = {}
      playerData.id = player.id
      // console.log(""+player.position.x+" "+player.position.y)
      playerData.position = {x: player.position.x, y: player.position.y}
      playerData.velocity = {x: player.velocity.x, y: player.velocity.y}
      playerData.mouseDirection = {x: player.mouseDirection.x, y: player.mouseDirection.y}
      roomUpdateData.push(playerData)
    }

    io.sockets.in(room.name).emit('update', {d:roomUpdateData})
  }
}


var gravity = 9

function updatePhysics(d){
  for(var r = 0; r < rooms.length; r++){
    var room = rooms[r]

    for(var i = 0; i < room.players.length; i++){
      var player = room.players[i];

      // console.log("cas "+gravity+" "+d+" "+(gravity*d))
      player.velocity.x = 0
      player.velocity.y += gravity*d

      if(player.position.y > 500){
        player.position.y = 500
      }
    }
  }
}



init();

update();


function Player(id, x, y){
  this.id = id
  // console.log("Creating New player "+id+" "+x+" "+y)
  this.position = new Vector2(x, y)
  this.movespeed = 130
  this.maxVelocityX = 5

  this.velocity = new Vector2(0, 0)

  this.mouseDirection = new Vector2(0, 0)

  this.inputs = {left: false, right: false}
}

Player.prototype.applyInputs = function(d){
  if(this.inputs.left){
    this.velocity.x = -this.movespeed*d
  }

  if(this.inputs.right){
    this.velocity.x = this.movespeed*d
  }

  if(this.velocity.x >= this.maxVelocityX){
    this.velocity.x = this.maxVelocityX
  }

  this.position.x += this.velocity.x
  this.position.y += this.velocity.y
}

function Vector2(x = 0, y = 0){
  this.x = x
  this.y = y
}


function Room(name){
  this.name = name
  this.players = []
}

Room.prototype.addPlayer = function(player){
  console.log("adding player to room")
  this.players.push(player)
}

Room.prototype.removePlayer = function(player){
  this.players.splice(this.players.indexOf(player), 1);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
