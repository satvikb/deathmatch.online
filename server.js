var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8000;

var server = require('http').createServer(app)
var fs = require('fs')

var util = require("util")

var origins = "deathmatch.online:8000"

var io = require("socket.io").listen(server, {origins:origins})

var utils = require("./util.js").utils
var ConstantsJS = require("./constants.js")
var PlayerJS = require("./player.js")
var RoomJS = require("./room.js")//"./room.js")
var ShootJS = require("./shoot.js")
var IDJS = require("./id.js")

var MapConstants = ConstantsJS.MapConstants()
var Maps = ConstantsJS.Maps()
var Guns = ShootJS.Guns
var CloneGun = ShootJS.CloneGun
var IDHandler = new IDJS.IDHandler()

Guns()

var Player = PlayerJS.Player

// var Room = RoomJS.Room
var RoomHandler = new RoomJS.RoomHandler(io)

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
  // util.log("Client has connected: "+client.id);

  client.on("jg", function(data){
    //create player

    var room = RoomHandler.findOpenRoom(client.id)
    if(room){
      var nickname = data.nickname
      if(nickname == ""){
        nickname = "player"
      }

      var clientId = IDHandler.generateID()

      var player = new Player(client.id, clientId, nickname, client, room, getRandomInt(0, 1000), 70)
      player.gunLeft = CloneGun(Guns["Pistol"])

      // console.log("Joining to "+room.name )
      client.join(room.name)

      //TODO Make efficient by using arrays
      var playerData = {id: player.clientId, nickname: nickname, x: player.getPos()[0], y: player.getPos()[1], map: room.map, gunL: player.getGunLeftId(), gunR: player.getGunRightId()}//, regions: room.regions}
      client.emit("jg", playerData)

      //Tell everyone else in the room of the new player
      client.broadcast.to(room.name).emit("np", playerData)
      //Tell the new player about existing players
      for(var i = 0; i < room.players.length; i++){
        var existingPlayer = room.players[i]
        var existingData = {id: existingPlayer.clientId, nickname: existingPlayer.nickname, x: existingPlayer.getPos()[0], y: existingPlayer.getPos()[1], gunL: player.getGunLeftId(), gunR: player.getGunRightId()}
        // console.log("telling "+client.id+" about "+existingPlayer.id)
        client.emit("np", existingData)
      }

      room.addPlayer(player)
    }

    //TODO Optimize
    client.on('i', function(data){
      player.inputs = data
    })

    client.on("disconnect", function(){
      if(room){
        room.removePlayer(player)
        client.broadcast.to(room.name).emit("rp", {id: client.clientId})
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

    for(var i = 0; i < room.players.length; i++){
      var player = room.players[i]
      player.sendUpdate()
    }
    // var roomUpdateData = {}
    //
    // roomUpdateData.l = room.leaderboard.getData(room.players.sort(room.leaderboard.sortScore)
    //
    // roomUpdateData.p = []
    // for(var i = 0; i < room.players.length; i++){
    //   var player = room.players[i]
    //   var playerData = {}
    //   playerData.id = player.clientId
    //
    //   var pos = player.getPos()
    //   var dir = player.inputs.direction
    //   var propHealth = player.health.currentHealth/player.health.maxHealth
    //   var timeLeft = room.timeLeft
    //   var roundProgress = room.timeLeft/room.roundTime
    //
    //   playerData.m = [rd(pos[0]), rd(pos[1]), rd(dir[0]), rd(dir[1]), rd(propHealth), rd(timeLeft), rd(roundProgress)]
    //
    //   if(player.gunLeft){
    //     var ammoLeftLeftGun = player.gunLeft.ammo.currentAmmo
    //     var ammoMaxLeftGun = player.gunLeft.ammo.maxAmmo // TODO Do not send max ammo every time, it is not going to change
    //
    //     //gun left data
    //     playerData.gl = [player.gunLeft.id, ammoLeftLeftGun]//{name: player.gunLeft.name, left: ammoLeftLeftGun, max: ammoMaxLeftGun} //TODO Send only this data to individual client that needs it, not to all
    //     // playerData.bulletsLeftGun = player.gunLeft.shootHandler.getBulletRayData()
    //   }
    //
    //   if(player.gunRight){
    //     var ammoLeftRightGun = player.gunRight.ammo.currentAmmo
    //     var ammoMaxRightGun = player.gunRight.ammo.maxAmmo
    //
    //     //gun right data
    //     playerData.gr = [player.gunRight.id, ammoLeftRightGun]//{name: player.gunRight.name, left: ammoLeftRightGun, max: ammoMaxRightGun}
    //     // playerData.bulletsRightGun = player.gunRight.shootHandler.getBulletRayData()
    //   }
    //
    //   roomUpdateData.p.push(playerData)
    // }
    //
    // io.sockets.in(room.name).emit('update', roomUpdateData)
  }
}

// round num
function rd(num){
  return parseFloat(num.toFixed(2))
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
