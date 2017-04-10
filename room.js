var constants = require('./constants.js')
var Leaderboard = require('./leaderboard.js').Leaderboard
var MapConstants = constants.MapConstants
var Maps = constants.Maps
var p2 = constants.p2
var utils = require('./util.js').utils

var hull = require('./hull/hull.js')

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

var MapIslandCreator = function(){

  // this.createJigsaw = function(){
  //   for(var x = 0; x )
  //
  // }

  var MapRegion = function(pos, size){
    this.pos = pos
    this.size = size

    this.createdIsland = false
    this.islandPoints = []

    this.createIsland = function(){
      var islandAABB = [this.pos[0] + this.size[0]*0.1, this.pos[1] + this.size[1]*0.1, this.size[0] * 0.8, this.size[1] * 0.8]

      var numPoints = 10
      var points = []

      for(var v = 0; v < numPoints; v++){
        var point = [getRandomInt(islandAABB[0], islandAABB[0]+islandAABB[2]), getRandomInt(islandAABB[1], islandAABB[1]+islandAABB[3])]
        points.push(point)
      }
      var newPoints = hull(points, 1000)

      this.islandPoints = newPoints
      this.createdIsland = true
    }
  }

  this.createMap = function(){
    var regions = this.createRegions()
    return regions
  }

  this.createRegions = function(){
    var numPiecesX = 5
    var pieceWidth = utils.size[0]/numPiecesX

    var regions = []

    for(var x = 0; x < numPiecesX; x++){
      var numPiecesY = 4//getRandomInt(3, 7)
      regions.push([])

      function getHeights(num, totalHeight){
        var heights = []

        var sumHeight = 0
        for(var i = 0; i < num; i++){
          var height = getRandomInt((totalHeight/num)*0.5, (totalHeight/num)*1.5)
          sumHeight += height

          if(sumHeight > totalHeight){
            height -= sumHeight-totalHeight
          }

          heights.push(height)
        }

        if(sumHeight < totalHeight){
          heights[num] -= (totalHeight-sumHeight)
        }

        return heights;
      }

      var prevY = 0
      var heights = getHeights(numPiecesY, utils.size[1])

      for(var y = 0; y < numPiecesY; y++){
        var height = heights[y]
        var region = new MapRegion([x*pieceWidth, prevY], [pieceWidth, height])

        if(getRandomInt(0, 100) < 30){
          region.createIsland()
        }

        regions[x][y] = region
        prevY += height
      }
    }

    return regions
  }
}

var RoomHandler = function(){
  this.rooms = [new Room(utils.randomString(10))]

  this.MAX_PER_ROOM = 10

  this.findOpenRoom = function(id){
    for(var i = 0; i < this.rooms.length; i++){
      var room = this.rooms[i]
      // var room = io.nsps["/"].adapter.rooms[rooms[i].name];
      // console.log("Room: "+room+" "+rooms[i]+" "+rooms[i].name+" "+JSON.stringify(io.nsps["/"].adapter.rooms))

      if(room.players.length < this.MAX_PER_ROOM){
        return this.rooms[i];
      }
    }

    //TODO Create new rooms based on new players
    // console.log("NOT ENOUGH SPACE IN ROOM")
    var room = new Room(utils.randomString(10))
    this.room.push(room)

    return room
  }
}


var Room = function(name){
  var that = this
  this.name = name
  this.players = []
  this.leaderboard = new Leaderboard()

  this.map = []
  this.regions = []

  this.roundTime = 60*1000
  this.startingIn = 3*1000

  this.updateCountdown = false
  this.countdownTime
  this.countdownEndTime

  this.roundStarted = false
  this.roundStartTime
  this.roundEndTime
  this.timeLeft

  this.world = new p2.World({gravity: [0, -500]})
  this.world.defaultContactMaterial.relaxation = 0.5
  this.world.defaultContactMaterial.friction = 0.4

  this.world.solver.frictionIterations = 10

  this.world.islandSplit = true
  this.world.sleepMode = p2.World.ISLAND_SLEEPING

  this.world.solver.iterations = 20
  this.world.solver.tolerance = 0.01
  this.world.setGlobalStiffness(1e8)
  // this.world.solver.relation = 0.9


  this.groundSize = [utils.size[0], 1]
  this.groundPos = [this.groundSize[0]/2, this.groundSize[1]/2]


  // this.world.addContactMaterial(MapConstants.groundPlayerCM);
  // this.world.addContactMaterial(MapConstants.tilePlayerCM);

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


  this.createMap = function(){
    // console.log("created map "+Maps.madeMaps)
    for(var x = 0; x < utils.mapSize[0]; x++){
      this.map.push([])
      for(var y = 0; y < utils.mapSize[1]; y++){
        this.map[x][utils.mapSize[1]-y] = Maps.defaultMap[y][x]//getRandomInt(0, 100) < 30 ? 1 : 0
      }
    }

    // this.regions = new MapIslandCreator().createMap()
    // this.map = this.regions
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


    // for(var x = 0; x < this.regions.length; x++){
    //   for(var y = this.regions[x].length-1; y >= 0; y--){
    //     var region = this.regions[x][y]
    //     var islandPoints = region.islandPoints
    //
    //     if(region.createdIsland == true){
    //
    //
    //       //offset points to origin
    //       var newIslandPoints = []
    //
    //       for(var i = 0; i < islandPoints.length; i++){
    //         var point = islandPoints[islandPoints.length-i]
    //         // point.x -= region.pos[0]
    //         // point.y -= region.pos[1]
    //         newIslandPoints.push(point)
    //       }
    //
    //
    //       var islandShape = new p2.Convex({vertices: islandPoints, material: MapConstants.tileMaterial})
    //       var islandBody = new p2.Body({mass: 0, position: [0, 0]})
    //       // islandBody.fromPolygon(islandPoints)
    //       // console.log(""+JSON.stringify(islandPoints))
    //       islandBody.addShape(islandShape)
    //       this.world.addBody(islandBody)
    //     }
    //   }
    // }
  }

  this.createBoundaries()
  this.createMap()
  this.createTileBodies()

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
            //TODO Emit to other clients
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

      // this.updateLeaderboard()

      if(this.timeLeft < 0){
        this.endRound()
      }
    }else if(this.updateCountdown){
      if(Date.now() - this.countdownTime > this.startingIn){
        this.startRound()
        this.updateCountdown = false
      }
    }
  }

  this.updateLeaderboard = function(){
    // TODO Don't send if the leaderboard did not change
    this.players.sort(this.leaderboard.sortScore)
    var data = this.leaderboard.getData(this.players)

    for(var i = 0; i < this.players.length; i++){
      var player = this.players[i]
      // player.socket.emit("leaderboard", data)
    }

  }

  this.startCountdown = function(){
    this.updateCountdown = true
    this.countdownTime = Date.now()
    this.countdownEndTime = Date.now()+this.startingIn
  }

  this.endRound = function(){
    this.roundStarted = false

    //reset
    for(var i = 0; i < this.players.length; i++){
      var player = this.players[i]
      player.reset()
    }
    this.startCountdown()
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
