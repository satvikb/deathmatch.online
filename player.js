var p2 = require('./constants.js').p2
var MapConstants = require("./constants.js").MapConstants

var Player = function(socketId, clientId, nickname, socket, room, x, y){
  this.socketId = socketId
  this.clientId = clientId

  this.nickname = nickname
  this.socket = socket
  this.room = room

  this.width = 48
  this.height = 48

  this.gunLeft
  this.gunRight

  this.shootLeftFrame = false
  this.shootLeftFrame = false

  this.oldPosition

  this.health = {
    currentHealth: 100,
    maxHealth: 100
  }

  this.scoreData = {
    score: 0,
    leaderboardPosition: 0
  }

  this.movespeed = 150
  this.jumpheight = 550

  this.inputs = [0, 0, 0, 0, 0, 0, 0]//{left: false, right: false, jump: false, shootLeft: false, shootRight: false, direction: [-1, 0]}

  this.getPos = function(){
    if(this.body){
      return this.body.position
    }else{
      return [0, 0]
    }
  }

  this.reset = function(){
    this.health = {
      currentHealth: 100,
      maxHealth: 100
    }

    this.scoreData = {
      score: 0,
      leaderboardPosition: 0 //TODO implement this?
    }

    if(this.gunLeft){
      this.gunLeft.reset()
    }
    if(this.gunRight){
      this.gunRight.reset()
    }
  }

  this.createBody = function(mass, posX, posY, width, height){
    this.body = new p2.Body({mass: mass, position: [posX, posY], fixedRotation: false, damping: 0})
    this.oldPosition = [posX, posY]
    this.body.isPlayer = true
    this.body.player = this
    this.shape = new p2.Box({width: width, height: height, material: MapConstants.playerMaterial})
    this.body.addShape(this.shape)
    this.room.world.addBody(this.body)
  }

  this.canJump = function(){
    for(var i = 0; i < this.room.world.narrowphase.contactEquations.length; i++){
      var c = this.room.world.narrowphase.contactEquations[i];
      if(c.bodyA === this.body || c.bodyB === this.body){
        var d = c.normalA[1];
        if(c.bodyA === this.body) d *= -1;
        if(d > 0.5) return true;
      }
    }
    return false;
  }

  this.subtractHealth = function(byAmount, info, killHandler){
    this.health.currentHealth -= byAmount

    if(this.health.currentHealth < 0){
      killHandler()
      this.kill()
    }
  }

  this.addScore = function(addScore, info){
    this.scoreData.score += addScore
    this.socket.emit("score", {score: this.scoreData.score, add: addScore, type: info.type})
  }

  this.kill = function(){
    if(room){
      room.removePlayer(this)
      io.sockets.connected[this.socketId].disconnect()
    }
  }

  this.sendUpdate = function(){
    var packetData = {}

    var leaderboard = this.room.leaderboard.getData(this.room.players.sort(this.room.leaderboard.sortScore))
    var roundProgress = this.room.timeLeft/this.room.roundTime

    packetData.gs = [parseFloat(roundProgress.toFixed(3)), leaderboard]

    var otherPlayerData = []
    for(var i = 0; i < this.room.players.length; i++){
      var otherPlayer = this.room.players[i]

      if(otherPlayer.clientId != this.clientId){
        var pos = otherPlayer.getPos()
        var dir = [otherPlayer.inputs[5], otherPlayer.inputs[6]]
        var propHealth = otherPlayer.health.currentHealth/otherPlayer.health.maxHealth

        var sl = bToI(otherPlayer.shootLeftFrame)
        var sr = bToI(otherPlayer.shootRightFrame)


        otherPlayerData.push([otherPlayer.clientId, rd(pos[0]), rd(pos[1]), rd(dir[0]), rd(dir[1]), rd(propHealth), sl, sr])

        // otherPlayer.shootLeftFrame = otherPlayer.shootRightFrame = false
      }
    }
    packetData.op = otherPlayerData

    //TODO test for changes
    var pos = this.getPos()
    var dir = [this.inputs[5], this.inputs[6]]
    var propHealth = this.health.currentHealth/this.health.maxHealth

    var sl = bToI(this.shootLeftFrame)
    var sr = bToI(this.shootRightFrame)

    var thisPlayerData = [this.clientId, rd(pos[0]), rd(pos[1]), rd(dir[0]), rd(dir[1]), rd(propHealth), sl, sr]
    packetData.p = thisPlayerData

    // this.shootLeftFrame = this.shootRightFrame = false

    if(this.gunLeft){
      var ammoLeftLeftGun = this.gunLeft.ammo.currentAmmo
      var ammoMaxLeftGun = this.gunLeft.ammo.maxAmmo // TODO Do not send max ammo every time, it is not going to change

      //gun left data
      packetData.gl = [this.gunLeft.id, ammoLeftLeftGun]//{name: player.gunLeft.name, left: ammoLeftLeftGun, max: ammoMaxLeftGun} //TODO Send only this data to individual client that needs it, not to all
    }

    if(this.gunRight){
      var ammoLeftRightGun = this.gunRight.ammo.currentAmmo
      var ammoMaxRightGun = this.gunRight.ammo.maxAmmo

      //gun right data
      packetData.gr = [this.gunRight.id, ammoLeftRightGun]//{name: player.gunRight.name, left: ammoLeftRightGun, max: ammoMaxRightGun}
    }

    this.socket.emit("u", packetData)
  }

  this.resetFrame = function(){
    this.shoootLeftFrame = this.shootRightFrame = false
  }

  this.getGunLeftId = function(){
    if(this.gunLeft){
      return this.gunLeft.id
    }else{
      return -1;
    }
  }

  this.getGunRightId = function(){
    if(this.gunRight){
      return this.gunRight.id
    }else{
      return -1;
    }
  }

  // round num
  function rd(num){
    return parseFloat(num.toFixed(2))
  }

  //bool to int
  function bToI(b){
    if(b == true){
      return 0
    }else{
      return 1
    }
  }

  this.createBody(50, x+this.width/2, y-this.height/2, this.width, this.height)
}

exports.Player = Player
