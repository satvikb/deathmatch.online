var p2 = require('./constants.js').p2
var MapConstants = require("./constants.js").MapConstants

var Player = function(id, nickname, socket, room, x, y){
  this.id = id
  this.nickname = nickname
  this.socket = socket
  this.room = room

  this.width = 48
  this.height = 48

  this.gunLeft
  this.gunRight
  // this.gunLeft = Guns.pistol
  // this.gunRight = Guns.machineGun

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

  this.inputs = {left: false, right: false, jump: false, shootLeft: false, shootRight: false, direction: [-1, 0]}

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
    this.body.isPlayer = true
    this.body.player = this
    this.shape = new p2.Box({width: width, height: height, material: MapConstants.playerMaterial})
    this.body.addShape(this.shape)
    this.room.world.addBody(this.body)
    console.log("New body")
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
      console.log("DEATH TO "+this.id)
      killHandler()
      this.kill()
    }
    console.log("Player "+this.id+" got hit by a "+info.type+" and dealt "+byAmount+" damage")
  }

  this.addScore = function(addScore, info){
    this.scoreData.score += addScore
    this.socket.emit("score", {score: this.scoreData.score, add: addScore, type: info.type})
  }

  this.kill = function(){
    if(room){
      room.removePlayer(this)
      io.sockets.connected[this.id].disconnect()
      console.log("remove player "+this.id)
    }
  }

  this.createBody(50, x+this.width/2, y-this.height/2, this.width, this.height)
}

exports.Player = Player
