var world = new p2.World({gravity: [0, -500]})
world.defaultContactMaterial.relaxation = 0.5
world.defaultContactMaterial.friction = 0.4

// world.setGlobalStiffness(1e5)
world.islandSplit = true
world.sleepMode = p2.World.ISLAND_SLEEPING

world.solver.frictionIterations = 10

world.solver.iterations = 20
world.solver.tolerance = 0.01
world.setGlobalStiffness(1e8)
// world.solver.relation = 0.9

var map = []
var regions = []

var fixedTimeStep = 1/60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock


var groundMaterial = new p2.Material();
var playerMaterial = new p2.Material();
var tileMaterial = new p2.Material();

var groundPlayerCM = new p2.ContactMaterial(groundMaterial, playerMaterial,{
 friction : 0,
 relaxation: 0.9,
});

var tilePlayerCM = new p2.ContactMaterial(tileMaterial, playerMaterial, {
  friction: 0.5,
  relaxation: 3,
  // stiffness: 1e8,
})

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

  // world.addContactMaterial(groundPlayerCM);
  // world.addContactMaterial(tilePlayerCM);

  createBoundaries()
  createMap()
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

function createMap(){
  var tileWidth = size[0]/mapSize[0]
  var tileHeight = size[1]/mapSize[1]

  for(var x = 0; x < map.length; x++){
    for(var y = map[x].length-1; y >= 0; y--){
      var tile = map[x][y]
      var offset = [tileWidth/2, -tileHeight/2]
      var pos = [(x*tileWidth)+offset[0], (y*tileHeight)+offset[1]]

      if(tile == 1){
        var tileShape = new p2.Box({width: tileWidth, height: tileHeight, material: tileMaterial})
        var tileBody = new p2.Body({mass: 0, position: pos})
        tileBody.addShape(tileShape)
        this.world.addBody(tileBody)

        //TODO Use different textures
        var tile = new PIXI.Sprite(PIXI.Texture.fromImage("tile_center.png"))
        tile.position.x = pos[0]
        tile.position.y = pos[1]
        tile.anchor.x = tile.anchor.y = 0.5
        tile.scale.x = tileWidth/8 //TODO Use dynamic tile pixel sizes
        tile.scale.y = tileHeight/8
        tileMap.addChild(tile)
      }

    }
  }


  // for(var x = 0; x < regions.length; x++){
  //   for(var y = regions[x].length-1; y >= 0; y--){
  //     var region = regions[x][y]
  //     var islandPoints = region.islandPoints
  //     console.log("region "+region.pos[0]+" "+region.pos[1]+" "+JSON.stringify(islandPoints))
  //     graphics.beginFill("0x"+Math.floor(Math.random()*16777215).toString(16))
  //     graphics.lineStyle(5, 0xFF0000)
  //
  //     if(region.createdIsland == true){
  //       // graphics.drawRect(region.pos[0], region.pos[1], region.size[0], region.size[1])
  //       var polygonPoints = []
  //       for(var i = 0; i < islandPoints.length; i++){
  //         var p = islandPoints[i]
  //         polygonPoints.push(p[0])
  //         polygonPoints.push(p[1])
  //       }
  //       // polygonPoints.push(0)
  //       // polygonPoints.push(0)
  //       graphics.drawPolygon(polygonPoints)
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
  //       var islandShape = new p2.Convex({vertices: islandPoints, material: tileMaterial})
  //       var islandBody = new p2.Body({mass: 0, position: [0,0]})
  //       // islandBody.fromPolygon(islandPoints)
  //       islandBody.addShape(islandShape)
  //       this.world.addBody(islandBody)
  //     }
  //     // graphics.endFill();
  //   }
  // }
}


function updatePhysics(d){
  world.step(fixedTimeStep, d, maxSubSteps)
  stepBullets()
  // for(var i = 0; i < allplayers.length; i++){
  //   var player = allplayers[i]
  //   if(player.body){
  //     // console.log(JSON.stringify(player.body.interpolatedPosition))
  //     // player.display.position.x = player.body.interpolatedPosition[0]//player.body.position[0]
  //     // player.display.position.y = player.body.interpolatedPosition[1]-player.height/2//player.body.position[1]-player.height/2
  //     // basicText.text = player.display.position.x+" "+player.view.position.x//player.body.position[0]+" "+player.body.position[1]
  //   }
  // }
}
