var constants = require('./constants.js')
var Leaderboard = require('./leaderboard.js').Leaderboard
var GameData = require("./gamedata.js").GameData
var MapConstants = constants.MapConstants
var Maps = constants.Maps
var p2 = constants.p2
var utils = require('./util.js').utils

var MapDataJS = require("./mapdata.js")
var GetMapFromId = MapDataJS.GetMapFromId
var Map = MapDataJS.Map
var MapData = MapDataJS.MapData

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var RoomHandler = function(){
  this.rooms = []

  this.MAX_PER_ROOM = GameData.gamedata["maxPerRoom"] || 4

  this.findOpenRoom = function(){
    for(var i = 0; i < this.rooms.length; i++){
      var room = this.rooms[i]

      if(room.players.length < this.MAX_PER_ROOM){
        return this.rooms[i];
      }
    }

    var room = new Room(utils.randomString(10))
    this.rooms.push(room)

    return room
  }
}


var Room = function(name){
  var that = this
  this.name = name
  this.players = []
  this.leaderboard = new Leaderboard()

  this.map = MapData.none
  // this.regions = []

  this.roundTime = GameData.gamedata["roundLength"] || 60*1000
  this.startingIn = GameData.gamedata["countdownLength"] || 3*1000

  this.updateCountdown = false
  this.countdownTime
  this.countdownEndTime

  this.roundStarted = false
  this.roundStartTime
  this.roundEndTime
  this.timeLeft

  this.world = new p2.World({gravity: [0, -1500]})
  this.world.defaultContactMaterial.relaxation = 1.8
  this.world.defaultContactMaterial.friction = 0.3

  this.world.solver.frictionIterations = undefined;

  this.world.islandSplit = true
  this.world.sleepMode = p2.World.ISLAND_SLEEPING

  this.world.solver.iterations = 20
  this.world.solver.tolerance = 0.01
  this.world.setGlobalStiffness(1e8)

  this.tilemapBody = new p2.Body({mass: 0})

  this.groundSize = [utils.size[0], 1]
  this.groundPos = [this.groundSize[0]/2, this.groundSize[1]/2]

  this.createBoundaries = function(){
    var thickness = 30

    // Create an ground body
    // Using a negative y position guarantees the body will actually be with the floor regardless of the thickness
    var groundBodyB = new p2.Body({
      mass: 0, position: [utils.size[0]/2, -thickness/2]
    });
    var groundShapeB = new p2.Box({width: utils.size[0], height: thickness, material: MapConstants.groundMaterial});
    groundBodyB.addShape(groundShapeB);
    this.world.addBody(groundBodyB);

    var groundBodyL = new p2.Body({
      mass: 0, position: [-thickness/2, utils.size[1]/2]
    });
    var groundShapeL = new p2.Box({width: thickness, height: utils.size[1], material: MapConstants.groundMaterial});
    groundBodyL.addShape(groundShapeL);
    this.world.addBody(groundBodyL);

    var groundBodyT = new p2.Body({
      mass: 0, position: [utils.size[0]/2, utils.size[1]+thickness/2]
    });
    var groundShapeT = new p2.Box({width: utils.size[0]/2, height: thickness, material: MapConstants.groundMaterial});
    groundBodyT.addShape(groundShapeT);
    this.world.addBody(groundBodyT);

    var groundBodyR = new p2.Body({
      mass: 0, position: [utils.size[0]+thickness/2, utils.size[1]/2]
    });
    var groundShapeR = new p2.Box({width: thickness, height: utils.size[1], material: MapConstants.groundMaterial});
    groundBodyR.addShape(groundShapeR);
    this.world.addBody(groundBodyR);
  }

  this.createTileBodies = function(){
    var tileWidth = utils.size[0]/utils.mapSize[0]
    var tileHeight = utils.size[1]/utils.mapSize[1]

    for(var x = 0; x < this.map.length; x++){
      for(var y = 0; y < this.map[x].length; y++){
        var tile = this.map[x][y]
        var offset = [tileWidth/2, -tileHeight/2]
        var pos = [(x*tileWidth)+offset[0], (y*tileHeight)+offset[1]]

        if(tile == 1){
          var tileShape = new p2.Box({width: tileWidth, height: tileHeight, material: constants.tileMaterial})
          var tileBody = new p2.Body({mass: 0, position: pos})
          tileBody.addShape(tileShape)
          this.world.addBody(tileBody)
        }
      }
    }
  }

  this.loadMap = function(d){
    var id = d
    if(d == undefined){
      id = 0
    }

    var newMap = GetMapFromId(id)
    // console.log("LOAD "+id+" "+newMap.id)

    if(newMap){
      this.map = null
      // change current map variable to map
      this.map = newMap

      // remove current physics bodies
      this.world.removeBody(this.tilemapBody)
      this.tilemapBody = new p2.Body({mass: 0})

      // add new physics bodies
      var mapData = newMap.data

      var tileWidth = utils.size[0]/utils.mapSize[0]
      var tileHeight = utils.size[1]/utils.mapSize[1]

      for(var y = 0; y < mapData.length; y++){
        for(var x = 0; x < mapData[y].length; x++){
          var tile = mapData[y][x]
          var offset = [tileWidth/2, -tileHeight/2]
          var pos = [(x*tileWidth)+offset[0], (y*tileHeight)+offset[1]]

          if(tile == 1){
            var tileShape = new p2.Box({width: tileWidth, height: tileHeight, material: constants.tileMaterial})
            this.tilemapBody.addShape(tileShape, pos)
          }
        }
      }
      this.world.addBody(this.tilemapBody)

    }else{
      console.log("No map!")
    }
  }

  this.createBoundaries()
  this.loadMap(0)

  this.world.on('postStep', function(event){
    for(var i = 0; i < that.players.length; i++){
      var player = that.players[i];

      player.oldPosition = player.body.position

      var leftMove = player.inputs[0] == 0 ? -1 : 0
      var rightMove = player.inputs[1] == 0 ? 1 : 0
      var totalMove = rightMove + leftMove

      var jump = player.inputs[2] == 0

      if(jump){
        if(player.canJump()){
          player.body.velocity[1] = player.jumpheight
        }
      }

      player.body.velocity[0] = player.movespeed*totalMove

      var shootLeft = player.inputs[3] == 0
      var shootRight = player.inputs[4] == 0
      var dir = [player.inputs[5], player.inputs[6]]

      if(dir){
        if(shootLeft){
          if(player.gunLeft){
            player.gunLeft.shoot(player, player.body.position, dir)
          }
        }

        if(shootRight){
          if(player.gunRight){
            player.gunRight.shoot(player, player.body.position, dir)
          }
        }
      }
    }
  })

  // To animate the bodies, we must step the world forward in time, using a fixed time step size.
  // The World will run substeps and interpolate automatically for us, to get smooth animation.
  this.fixedTimeStep = 1/60; // seconds
  this.maxSubSteps = 10; // Max sub steps to catch up with the wall clock


  this.update = function(d){
    this.updateRound(d)
  }

  this.updateRound = function(d){
    if(this.roundStarted){
      this.timeLeft = this.roundTime-(Date.now() - this.roundStartTime)

      this.world.step(this.fixedTimeStep, d, this.maxSubSteps)
      this.updateBullets(d)

      if(this.timeLeft < 0){
        this.endRound()
      }
    }else if(this.updateCountdown){
      if(Date.now() - this.countdownTime > this.startingIn){
        this.resetPlayers()
        this.startRound()
        this.updateCountdown = false
      }
    }
  }

  this.startCountdown = function(){
    this.updateCountdown = true
    this.countdownTime = Date.now()
    this.countdownEndTime = Date.now()+this.startingIn
  }

  this.endRound = function(){
    this.roundStarted = false
    this.startCountdown()
  }

  this.resetPlayers = function(){
    //reset
    for(var i = 0; i < this.players.length; i++){
      var player = this.players[i]
      player.reset()
    }
  }

  this.startRound = function(){
    this.roundStarted = true
    this.roundStartTime = Date.now()
    this.roundEndTime = this.roundStartTime+this.roundTime
  }

  this.updateBullets = function(d){
    for(var i = 0; i < this.players.length; i++){
      var player = that.players[i];

      if(player.gunLeft){
        player.gunLeft.step()
      }

      if(player.gunRight){
        player.gunRight.step()
      }
    }
  }

  this.addPlayer = function(player){
    this.players.push(player)
  }

  this.removePlayer = function(player){
    this.players.splice(this.players.indexOf(player), 1);
    this.world.removeBody(player.body)
  }

  this.startCountdown()
}

module.exports.RoomHandler = RoomHandler
module.exports.Room = Room
