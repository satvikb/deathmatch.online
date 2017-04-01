var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8000;

var server = require('http').createServer(app)
var fs = require('fs')

var util = require("util")
var io = require("socket.io").listen(server, {origins:'localhost:8000:*'})

var utils = require("./util.js").utils
var ConstantsJS = require("./constants.js")
var PlayerJS = require("./player.js")
var RoomJS = require("./room.js")//"./room.js")
var ShootJS = require("./shoot.js")

var MapConstants = ConstantsJS.MapConstants()
var Maps = ConstantsJS.Maps()
var Guns = ShootJS.Guns
Guns()

var Player = PlayerJS.Player

// var Room = RoomJS.Room
var RoomHandler = new RoomJS.RoomHandler()

console.log("Room "+RoomHandler+" "+utils.size[0]+" ")
var ShootHandler = ShootJS.ShootHandler
var BulletData = ShootJS.BulletData
var Gun = ShootJS.Gun

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

    var room = RoomHandler.findOpenRoom(client.id)
    if(room){
      var player = new Player(client.id, room, getRandomInt(0, 1000), 300)
      player.gunLeft = Guns.pistol

      console.log("Joining to "+room.name )
      client.join(room.name)

      var playerData = {id: player.id, x: player.getPos()[0], y: player.getPos()[1], map: room.map}//, regions: room.regions}
      client.emit("joingame", playerData)

      //Tell everyone else in the room of the new player
      client.broadcast.to(room.name).emit("newplayer", playerData)
      //Tell the new player about existing players
      for(var i = 0; i < room.players.length; i++){
        var existingPlayer = room.players[i]
        var existingData = {id: existingPlayer.id, x: existingPlayer.getPos()[0], y: existingPlayer.getPos()[1]}
        console.log("telling "+client.id+" about "+existingPlayer.id)
        client.emit("newplayer", existingData)
      }

      room.addPlayer(player)
    }

    //TODO Optimize
    client.on('input', function(data){
      player.inputs = data

    })

    client.on("disconnect", function(){
      if(room){
        room.removePlayer(player)
        client.broadcast.to(room.name).emit("removeplayer", {id: client.id})
        console.log("remove player "+client.id)
      }
    })
  })
};

var time = Date.now()
var delta;

function update(){
  delta = (Date.now()-time)/1000
  updateRooms(delta)

  sendUpdate()
  setTimeout(update, 1/60)

  time = Date.now()
}

function sendUpdate(){
  for(var r = 0; r < RoomHandler.rooms.length; r++){
    var room = RoomHandler.rooms[r];
    var roomUpdateData = []

    for(var i = 0; i < room.players.length; i++){
      var player = room.players[i]
      var playerData = {}
      playerData.id = player.id
      playerData.position = {x: player.getPos()[0], y: player.getPos()[1]}
      // console.log("dir "+JSON.stringify(player.inputs.direction)+" "+player.inputs.direction.length)
      playerData.direction = {x: player.inputs.direction[0], y: player.inputs.direction[1]}
      playerData.health = {current: player.health.currentHealth, max: player.health.maxHealth}
      // playerData.mouseDirection = {x: player.mouseDirection.x, y: player.mouseDirection.y}

      if(player.gunLeft){
        var ammoLeftLeftGun = player.gunLeft.ammo.currentAmmo
        var ammoMaxLeftGun = player.gunLeft.ammo.maxAmmo // TODO Do not send max ammo every time, it is not going to change
        playerData.gunLeftData = {name: player.gunLeft.name, left: ammoLeftLeftGun, max: ammoMaxLeftGun} //TODO Send only this data to individual client that needs it, not to all
        playerData.bulletsLeftGun = player.gunLeft.shootHandler.getBulletRayData()
      }

      if(player.gunRight){
        var ammoLeftRightGun = player.gunRight.ammo.currentAmmo
        var ammoMaxRightGun = player.gunRight.ammo.maxAmmo
        playerData.gunRightData = {name: player.gunRight.name, left: ammoLeftRightGun, max: ammoMaxRightGun}
        playerData.bulletsRightGun = player.gunRight.shootHandler.getBulletRayData()
      }

      roomUpdateData.push(playerData)
    }

    io.sockets.in(room.name).emit('update', {d:roomUpdateData})
  }
}

function updateRooms(d){

  for(var i = 0; i < RoomHandler.rooms.length; i++){
    var room = RoomHandler.rooms[i];
    room.update(d)
  }
}

init();
update();


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
