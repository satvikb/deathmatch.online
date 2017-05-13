var world = new p2.World({gravity: [0, -1000]})
world.defaultContactMaterial.relaxation = 1.8
world.defaultContactMaterial.friction = 0.3

// world.setGlobalStiffness(1e5)
world.islandSplit = true
world.sleepMode = p2.World.ISLAND_SLEEPING

world.solver.frictionIterations = undefined

world.solver.iterations = 20
world.solver.tolerance = 0.01
world.setGlobalStiffness(1e8)
// world.solver.relaxation = 0.9

var map = Maps.none
// var regions = []
var tilemapBody = new p2.Body({mass: 0})

var fixedTimeStep = 1/60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock

var groundMaterial = new p2.Material();
var playerMaterial = new p2.Material();
var tileMaterial = new p2.Material();

function setupWorld(){
  world.on('postStep', function(event){
    if(localPlayer){
      var leftMove = left == true ? -1 : 0
      var rightMove = right == true ? 1 : 0
      var totalMove = rightMove + leftMove

      //move x
      localPlayer.body.velocity[0] = localPlayer.movespeed*totalMove

      //jump
      if(jump){
        if(jump == true && localPlayer.canJump()){
          localPlayer.body.velocity[1] = localPlayer.jumpheight
        }
      }
    }
  })

  createBoundaries()
}

function createBoundaries(){
  var thickness = 30

  // Create an ground body
  // Using a negative y position guarantees the body will actually be with the floor regardless of the thickness
  var groundBodyB = new p2.Body({
    mass: 0, position: [size[0]/2, -thickness/2]
  });

  var groundShapeB = new p2.Box({width: size[0], height: thickness, material: groundMaterial});
  groundBodyB.addShape(groundShapeB);
  world.addBody(groundBodyB);



  var groundBodyL = new p2.Body({
    mass: 0, position: [-thickness/2, size[1]/2]
  });

  var groundShapeL = new p2.Box({width: thickness, height: size[1], material: groundMaterial});
  groundBodyL.addShape(groundShapeL);
  world.addBody(groundBodyL);




  var groundBodyT = new p2.Body({
    mass: 0, position: [size[0]/2, size[1]+thickness/2]
  });

  var groundShapeT = new p2.Box({width: size[0]/2, height: thickness, material: groundMaterial});
  groundBodyT.addShape(groundShapeT);
  world.addBody(groundBodyT);



  var groundBodyR = new p2.Body({
    mass: 0, position: [size[0]+thickness/2, size[1]/2]
  });

  var groundShapeR = new p2.Box({width: thickness, height: size[1], material: groundMaterial});
  groundBodyR.addShape(groundShapeR);
  world.addBody(groundBodyR);
}

function loadMap(d){
  var id = d
  if(d == undefined){
    id = 0
  }

  var newMap = GetMapFromId(id)
  map = newMap
  if(newMap){
    var mapData = newMap.data
    var tileWidth = size[0]/mapSize[0]
    var tileHeight = size[1]/mapSize[1]
    var tilePixelWidth = gameData.texturedata["tile"]["width"]
    var tilePixelHeight = gameData.texturedata["tile"]["height"]
    console.log("new map "+newMap+" "+mapData[0][0]+" "+newMap.name+" "+mapData.length+" "+mapData[0].length)

    // remove current physics bodies
    world.removeBody(tilemapBody)
    tilemapBody = new p2.Body({mass: 0})

    // TODO not all are being removed for some reason
    for(var i = 0; i < tileMap.children.length; i++){
      tileMap.removeChild(tileMap.children[i])
      console.log('removing '+i)
    }

    stage.removeChild(tileMap)
    tileMap = new Container()
    stage.addChild(tileMap)

    for(var x = 0; x < mapData.length; x++){
      for(var y = 0; y < mapData[x].length; y++){
        var tile = mapData[x][y]
        var offset = [tileWidth/2, -tileHeight/2]
        var pos = [(x*tileWidth)+offset[0], (y*tileHeight)+offset[1]]

        if(tile == 1){
          var tileShape = new p2.Box({width: tileWidth, height: tileHeight, material: tileMaterial})
          // var tileBody = new p2.Body({mass: 0, position: pos})
          tilemapBody.addShape(tileShape, pos)

          function getTileTexForPos(){
            function getTile(nx,ny){
              if(nx>=0&&nx<=mapData.length-1&&ny>=0&&ny<=mapData[x].length-1){
                return mapData[nx][ny]
              }else{
                return 0
              }
            }
            //TODO Maybe the axis are inversed for y/x?
            var left = getTile(x-1, y) != 0
            var right = getTile(x+1, y) != 0
            var top = getTile(x, y+1) != 0
            var bottom = getTile(x, y-1) != 0

            /*
            0 = all borders
            1 = u-border
            2 = pipe border
            3 = side border
            4 = no border
            */
            // var tileType = 0 //aka num of filled tiles around
            // if(left != 0){tileType++}

            //texture from id
            function tI(id){
              return PIXI.Texture.fromImage("tiles_"+id+".png")
            }

            var texture;
            var rotation = 0;

            //TODO fix rotations. right now 90 degrees to clockwise
            //TODO return every if statement
            if(left && right && top && bottom){
              texture = tI(0)
            }


            if(!left && !right && !top && !bottom){
              texture = tI(1)
            }


            if(!left && !right && top && bottom){
              texture = tI(2)
              rotation = 0
            }

            if(left && right && !top && !bottom){
              texture = tI(2)
              rotation = 90
            }


            if(!left && !right && !top && bottom){
              texture = tI(3)
              rotation = 0
            }

            if(left && !right && !top && !bottom){
              texture = tI(3)
              rotation = 90
            }

            if(!left && !right && top && !bottom){
              texture = tI(3)
              rotation = 180
            }

            if(!left && right && !top && !bottom){
              texture = tI(3)
              rotation = 270
            }


            if(left && right && !top && bottom){
              texture = tI(4)
              rotation = 0
            }

            if(left && !right && top && bottom){
              texture = tI(4)
              rotation = 90
            }

            if(left && right && top && !bottom){
              texture = tI(4)
              rotation = 180
            }

            if(!left && right && top && bottom){
              texture = tI(4)
              rotation = 270
            }


            if(left && !right && !top && bottom){
              texture = tI(5)
              rotation = 0
            }

            if(left && !right && top && bottom){
              texture = tI(5)
              rotation = 90
            }

            if(!left && right && top && !bottom){
              texture = tI(5)
              rotation = 180
            }

            if(!left && right && !top && bottom){
              texture = tI(5)
              rotation = 270
            }

            rotation = (rotation*Math.PI)/180

            return [texture, rotation]
          }

          var tileData = getTileTexForPos()

          //TODO Use different textures
          var tile = new PIXI.Sprite(tileData[0])
          tile.position.x = pos[0]
          tile.position.y = pos[1]
          tile.rotation = tileData[1]
          tile.anchor.x = tile.anchor.y = 0.5
          tile.scale.x = tileWidth/tilePixelWidth //TODO Use dynamic tile pixel sizes (8 is tile image width)
          tile.scale.y = tileHeight/tilePixelHeight
          tileMap.addChild(tile)
        }
      }
    }
    world.addBody(tilemapBody)
  }else{
    console.log("NO MAP!")
  }
}

function updatePhysics(d){
  world.step(fixedTimeStep, d, maxSubSteps)
}
