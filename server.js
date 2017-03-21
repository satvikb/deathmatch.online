var express = require('express');
var path = require('path');
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
var port = process.env.PORT || 8000;

var server = require('http').createServer(app)
var fs = require('fs')

var util = require("util")
var io = require("socket.io").listen(server, {origins:'192.168.1.8:8000:*'})

var p2 = require('p2')

var size = [1920, 1080]

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


    var room = findOpenRoom()
    if(room){
      var player = new Player(client.id, room, getRandomInt(0, 1000), 300)

      console.log("Joining to "+room.name )
      client.join(room.name)

      var playerData = {id: player.id, x: player.getPos()[0], y: player.getPos()[1]}
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
  delta = (Date.now()-time)/1000

  // var deltaTime = lastTime ? (time - lastTime) / 1000 : 0;

  // updateControls(deltaTime)
  updatePhysics(delta)

  sendUpdate()
  setTimeout(update, 1/30)//delta/1000)

  // lastTime = time
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
      playerData.position = {x: player.getPos()[0], y: player.getPos()[1]}
      // playerData.velocity = {x: player.velocity.x, y: player.velocity.y}
      playerData.mouseDirection = {x: player.mouseDirection.x, y: player.mouseDirection.y}
      roomUpdateData.push(playerData)
    }

    io.sockets.in(room.name).emit('update', {d:roomUpdateData})
  }
}

function updatePhysics(d){
  // for(var r = 0; r < rooms.length; r++){
  //   var room = rooms[r]
  //   console.log(room)
  //   room.addPlayer(new Player("3", room, 2, 2))
  //   room.updatePhysics(d)
  // }
  // new Player("sdf", new Room("fds"), 13 , 3).createBody()
  // new Room("fs").updatePhysics(d)

  for(var i = 0; i < rooms.length; i++){
    // var room = io.sockets.adapter.rooms[rooms[i].name];
    // console.log("Room: "+room.length)
    // if(room.length < MAX_PER_ROOM){
      var room = rooms[i];
      room.updatePhysics(d)
    // }
  }
}



init();

update();


function Player(id, room, x, y){
  this.id = id
  this.room = room
  // console.log("Creating New player "+id+" "+x+" "+y)
  // this.position = new Vector2(x, y)
  this.movespeed = 30

  this.velocity = new Vector2(0, 0)

  this.mouseDirection = new Vector2(0, 0)

  this.inputs = {left: false, right: false}

  this.getPos = function(){
    if(this.body){
      return this.body.position
    }else{
      return [0, 0]
    }
  }

  this.createBody = function(mass, posX, posY, width, height){
    this.body = new p2.Body({mass: mass, position: [posX, posY], fixedRotation: true, damping: 0.5})
    this.shape = new p2.Box({width: width, height: height})
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

  this.createBody(1, x, y, 5, 5)
}

function Vector2(x = 0, y = 0){
  this.x = x
  this.y = y
}


function Room(name){
  var that = this
  this.name = name
  this.players = []

  this.world = new p2.World({gravity: [0, -9.82]})

  // Create an infinite ground plane body
  this.groundBody = new p2.Body({
    mass: 0, position: [0, 5] // Setting mass to 0 makes it static
  });
  this.groundShape = new p2.Box({width: size[0], height:1});
  this.groundBody.addShape(this.groundShape);
  this.world.addBody(this.groundBody);


  this.world.on('postStep', function(event){
    for(var i = 0; i < that.players.length; i++){
      var player = that.players[i];

      var leftMove = player.inputs.left == true ? -1 : 0
      var rightMove = player.inputs.right == true ? 1 : 0
      var totalMove = rightMove + leftMove

      player.body.velocity[0] = player.movespeed*totalMove
      // if(player.inputs.left){
      //   player.body.velocity[0] = -player.movespeed*delta
      //   console.log("move left "+delta)
      // }
      //
      // if(player.inputs.right){
      //   player.body.velocity[0] = player.movespeed*delta
      // }
    }
  })

  // To animate the bodies, we must step the world forward in time, using a fixed time step size.
  // The World will run substeps and interpolate automatically for us, to get smooth animation.
  this.fixedTimeStep = 1 / 30; // seconds
  this.maxSubSteps = 10; // Max sub steps to catch up with the wall clock


  this.updatePhysics = function(d){
    this.world.step(this.fixedTimeStep, d, this.maxSubSteps)


  }

  this.addPlayer = function(player){
    console.log("adding player to room")
    this.players.push(player)
  }

  this.removePlayer = function(player){
    this.players.splice(this.players.indexOf(player), 1);
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
