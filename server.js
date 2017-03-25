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
var mapSize = [32, 18]

var rooms = [new Room("test")]

constants()


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

    var room = findOpenRoom(client.id)
    if(room){
      var player = new Player(client.id, room, getRandomInt(0, 1000), 300)

      console.log("Joining to "+room.name )
      client.join(room.name)

      var playerData = {id: player.id, x: player.getPos()[0], y: player.getPos()[1], map: room.map}
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

var MAX_PER_ROOM = 10


function findOpenRoom(id){
  for(var i = 0; i < rooms.length; i++){
    var room = rooms[i]
    // var room = io.nsps["/"].adapter.rooms[rooms[i].name];
    // console.log("Room: "+room+" "+rooms[i]+" "+rooms[i].name+" "+JSON.stringify(io.nsps["/"].adapter.rooms))

    if(room.players.length < MAX_PER_ROOM){
      return rooms[i];
    }
  }
  //TODO Create new rooms based on new players
  console.log("NOT ENOUGH SPACE IN ROOM")
  return null
}


var time = Date.now()
var delta;

function update(){
  delta = (Date.now()-time)/1000
  updatePhysics(delta)

  sendUpdate()
  setTimeout(update, 1/60)

  time = Date.now()
}

function sendUpdate(){
  for(var r = 0; r < rooms.length; r++){
    var room = rooms[r];
    var roomUpdateData = []

    for(var i = 0; i < room.players.length; i++){
      var player = room.players[i]
      var playerData = {}
      playerData.id = player.id
      playerData.position = {x: player.getPos()[0], y: player.getPos()[1]}
      // console.log("dir "+JSON.stringify(player.inputs.direction)+" "+player.inputs.direction.length)
      playerData.direction = {x: player.inputs.direction[0], y: player.inputs.direction[1]}
      // playerData.velocity = {x: player.velocity.x, y: player.velocity.y}
      // playerData.mouseDirection = {x: player.mouseDirection.x, y: player.mouseDirection.y}

      var ammoLeftLeftGun = player.gunLeft.ammo.currentAmmo
      var ammoMaxLeftGun = player.gunLeft.ammo.maxAmmo // TODO Do not send max ammo every time, it is not going to change
      var ammoLeftRightGun = player.gunRight.ammo.currentAmmo
      var ammoMaxRightGun = player.gunRight.ammo.maxAmmo // TODO Do not send max ammo every time, it is not going to change


      playerData.ammoLeft = {left: ammoLeftLeftGun, max: ammoMaxLeftGun}
      playerData.ammoRight = {left: ammoLeftRightGun, max: ammoMaxRightGun}

      playerData.testBullet = player.gunLeft.shootHandler.getBulletRayData()//bulletData
      roomUpdateData.push(playerData)
    }

    io.sockets.in(room.name).emit('update', {d:roomUpdateData})
  }
}

function updatePhysics(d){

  for(var i = 0; i < rooms.length; i++){
    var room = rooms[i];
    room.updatePhysics(d)
  }
}

init();
update();

function Player(id, room, x, y){
  this.id = id
  this.room = room

  this.width = 16
  this.height = 64

  //test   function Gun(id, laserLength, shootSpeed, travelSpeed, maxAmmo, thickness){
  this.gunLeft = new Gun(0, 5, 50, 1, 100, 1)
  this.gunRight = new Gun(-1, 0, 0, 0, 0, 0)

  this.movespeed = 80
  this.jumpheight = 350

  this.inputs = {left: false, right: false, jump: false, shootLeft: false, shootRight: false, direction: [-1, 0]}

  this.getPos = function(){
    if(this.body){
      return this.body.position
    }else{
      return [0, 0]
    }
  }

  this.createBody = function(mass, posX, posY, width, height){
    this.body = new p2.Body({mass: mass, position: [posX, posY], fixedRotation: true, damping: 0})
    this.shape = new p2.Box({width: width, height: height, material: constants.playerMaterial})
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

  this.createBody(51, x+this.width/2, y-this.height/2, this.width, this.height)
}

function constants(){
  if ( typeof constants.setup == undefined ) {
    constants.setup = true
    constants.groundMaterial = new p2.Material();
    constants.tileMaterial = new p2.Material();
    constants.playerMaterial = new p2.Material();
    constants.groundPlayerCM = new p2.ContactMaterial(constants.groundMaterial, constants.playerMaterial, {
     friction : 0,
    });
    constants.tilePlayerCM = new p2.ContactMaterial(constants.tileMaterial, constants.playerMaterial, {
      friction: 0,
    })
  }
}

function Room(name){
  var that = this
  this.name = name
  this.players = []

  this.map = []

  this.world = new p2.World({gravity: [0, -500]})
  this.world.defaultContactMaterial.friction = 0.5
  // this.world.setGlobalStiffness(1e5)


  this.groundSize = [size[0], 1]
  this.groundPos = [this.groundSize[0]/2, this.groundSize[1]/2]

  // Create an infinite ground plane body
  this.groundBody = new p2.Body({
    mass: 0, position: this.groundPos // Setting mass to 0 makes it static
  });
  this.groundShape = new p2.Box({width: this.groundSize[0], height: this.groundSize[1], material: constants.groundMaterial});
  this.groundBody.addShape(this.groundShape);
  this.world.addBody(this.groundBody);
  console.log(this.groundShape.width+" "+this.groundBody.position[0])

  this.world.addContactMaterial(constants.groundPlayerCM);
  this.world.addContactMaterial(constants.tilePlayerCM);

  this.createMap = function(){
    for(var x = 0; x < mapSize[0]; x++){
      this.map.push([])
      for(var y = 0; y < mapSize[1]; y++){
        this.map[x][y] = getRandomInt(0, 100) < 30 ? 1 : 0
      }
    }
  }

  this.createTileBodies = function(){
    var tileWidth = size[0]/mapSize[0]
    var tileHeight = size[1]/mapSize[1]

    for(var x = 0; x < this.map.length; x++){
      for(var y = 0; y < this.map[x].length; y++){
        var tile = this.map[x][y]
        var pos = [x*tileWidth, y*tileHeight]

        if(tile == 1){
          var tileShape = new p2.Box({width: tileWidth, height: tileHeight, material: constants.tileMaterial})
          var tileBody = new p2.Body({mass: 0, position: pos})
          tileBody.addShape(tileShape)
          this.world.addBody(tileBody)
        }
      }
    }
  }

  this.createMap()
  this.createTileBodies()

  this.world.on('postStep', function(event){
    for(var i = 0; i < that.players.length; i++){
      var player = that.players[i];

      var leftMove = player.inputs.left == true ? -1 : 0
      var rightMove = player.inputs.right == true ? 1 : 0
      var totalMove = rightMove + leftMove

      var jump = player.inputs.jump

      if(jump){
        if(jump == true){
          if(player.canJump()){
            player.body.velocity[1] = player.jumpheight
          }
        }
      }

      player.body.velocity[0] = player.movespeed*totalMove

      var shootLeft = player.inputs.shootLeft
      var shootRight = player.inputs.shootRight
      var dir = player.inputs.direction

      //TODO Check if guns exist
      if(dir){
        if(shootLeft){
          if(shootLeft == true){
            if(player.gunLeft){
              player.gunLeft.shoot(player, player.body.position, dir)
            }
          }
        }

        if(shootRight){
          if(shootRight == true){
            if(player.gunRight){
              player.gunRight.shoot(player, player.body.position, dir)
            }
          }
        }
      }
    }
  })

  // To animate the bodies, we must step the world forward in time, using a fixed time step size.
  // The World will run substeps and interpolate automatically for us, to get smooth animation.
  this.fixedTimeStep = 1/60; // seconds
  this.maxSubSteps = 10; // Max sub steps to catch up with the wall clock


  this.updatePhysics = function(d){
    this.world.step(this.fixedTimeStep, d, this.maxSubSteps)
    this.updateBullets(d)
  }

  this.updateBullets = function(d){
    for(var i = 0; i < this.players.length; i++){
      var player = that.players[i];

      if(player.gunLeft){
        player.gunLeft.shootHandler.step()
      }

      if(player.gunRight){
        player.gunRight.shootHandler.step()
      }
    }
  }

  this.addPlayer = function(player){
    console.log("adding player to room")
    this.players.push(player)
  }

  this.removePlayer = function(player){
    this.players.splice(this.players.indexOf(player), 1);
    this.world.removeBody(player.body)
  }
}

function Gun(id, laserLength, shootSpeed, travelSpeed, maxAmmo, thickness){
  this.id = id

  this.ammo = {
    currentAmmo: maxAmmo,
    maxAmmo: maxAmmo,
    bulletPerReload: 1, //Multiple bullets can be reloaded at one time
    reloadSpeed: 50
  }

  this.laserLength = laserLength
  this.shootSpeed = shootSpeed
  this.travelSpeed = travelSpeed
  this.thickness = thickness

  this.shootHandler = new ShootHandler(this)

  this.time = Date.now()

  this.shoot = function(player, start, direction){
    if(Date.now()-this.time > this.shootSpeed){
      if(this.ammo.currentAmmo > 0){
        this.shootHandler.addBullet(player, start, direction)
        this.ammo.currentAmmo -= 1
        this.time = Date.now()
      }
    }
  }
}

function ShootHandler(gun){
  this.gun = gun
  this.bulletData = []

  this.getBulletRayData = function(){
    var data = []

    for(var b = 0; b < this.bulletData.length; b++){
      var bullet = this.bulletData[b]
      var from = bullet.displayFrom//ray.from
      var to = bullet.displayTo//ray.to

      var col = bullet.color
      var thickness = bullet.thickness

      data.push([from[0], from[1], to[0], to[1], thickness, col])
    }
    return data
  }

  this.addBullet = function(player, startPos, direction){
    var laserLength = p2.vec2.create();
    p2.vec2.scale(laserLength, direction, this.gun.laserLength)
    var travelSpeedDistance = p2.vec2.create()
    p2.vec2.scale(travelSpeedDistance, direction, this.gun.travelSpeed)


    var endDisplayPos = p2.vec2.create()
    p2.vec2.add(endDisplayPos, startPos, laserLength)

    var endRayPos = p2.vec2.create();
    p2.vec2.copy(endRayPos, endDisplayPos)
    p2.vec2.add(endRayPos, endDisplayPos, travelSpeedDistance)

    var bullet = new BulletData(player, this.gun, startPos, endRayPos, endDisplayPos, direction, this.gun.thickness)
    this.bulletData.push(bullet)
  }

  this.step = function(){
    var bulletsToRemove = []

    for(var b = 0; b < this.bulletData.length; b++){
      var bullet = this.bulletData[b]
      bullet.step()

      var bPosF = bullet.ray.from
      var bX = bPosF[0]
      var bY = bPosF[1]

      var boundSize = [size[0]*0.05, size[1]*0.05]

      if(bX > (size[0]+boundSize[0]) || bX < (-boundSize[0]) || bY > (size[1]+boundSize[1]) || bY < (-boundSize[1])){
        // console.log("OOB "+bX+" "+bY)
        //Out of bouunds
        bulletsToRemove.push(bullet)
      }

      if(bullet.remove == true){
        bulletsToRemove.push(bullet)
      }
    }

    for(var b = 0; b < bulletsToRemove.length; b++){
      var bul = bulletsToRemove[b]
      this.bulletData.splice(this.bulletData.indexOf(bul), 1);
      // console.log("removing bullet")
    }
    bulletsToRemove = []
  }
}

function BulletData(player, gun, from, toRay, toDisplay, direction, thickness){
  this.gun = gun
  this.player = player
  this.ray = new p2.Ray({
    mode: p2.Ray.ANY
  })

  this.displayFrom = from
  this.displayTo = toDisplay

  this.ray.from = from
  this.ray.to = toRay

  this.direction = direction

  this.color = '0x'+Math.floor(Math.random()*16777215).toString(16)
  this.thickness = thickness

  // What point (from or to) should change in the ray the next step
  // This is to prevent the ray from skipping on invisible objects
  // this.prevStepChange = 0

  this.remove = false

  this.step = function(){
    var newFrom = p2.vec2.create()
    var newToRay = p2.vec2.create()
    var newToDisplay = p2.vec2.create()

    var laserDistance = p2.vec2.create()
    var travelSpeedDistance = p2.vec2.create()

    p2.vec2.copy(newFrom, this.ray.to)

    p2.vec2.scale(laserDistance, this.direction, this.gun.laserLength)
    p2.vec2.scale(travelSpeedDistance, this.direction, this.gun.travelSpeed)

    this.ray.from = newFrom
    this.displayFrom = newFrom

    p2.vec2.add(newToDisplay, newFrom, laserDistance)
    this.displayTo = newToDisplay

    p2.vec2.add(newToRay, newToDisplay, travelSpeedDistance)
    this.ray.to = newToRay

    this.ray.update()

    // Handle collisions
    var result = new p2.RaycastResult()
    this.player.room.world.raycast(result, this.ray)

    var hitPoint = p2.vec2.create()
    result.getHitPoint(hitPoint, this.ray)
    if(result.body && result.body != this.player.body){
      // console.log("Bullet hit "+hitPoint[0]+" "+hitPoint[1]+" "+result.getHitDistance(this.ray)+" "+result.body)
      this.remove = true
    }
  }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
