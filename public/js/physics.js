var world = new p2.World({gravity: [0, -500]})
world.defaultContactMaterial.friction = 0.5
// world.setGlobalStiffness(1e5)

var map = []

var fixedTimeStep = 1/60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock


var groundMaterial = new p2.Material();
var playerMaterial = new p2.Material();
var tileMaterial = new p2.Material();

var groundSize = [size[0], 1]
var groundPos = [groundSize[0]/2, groundSize[1]/2]

var groundPlayerCM = new p2.ContactMaterial(groundMaterial, playerMaterial,{
 friction : 0,
});

var tilePlayerCM = new p2.ContactMaterial(tileMaterial, playerMaterial, {
  friction: 0,
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

  // Create an infinite ground plane body
  var groundBody = new p2.Body({
    mass: 0, position: groundPos // Setting mass to 0 makes it static
  });

  var groundShape = new p2.Box({width: groundSize[0], height: groundSize[1], material: groundMaterial});
  groundBody.addShape(groundShape);
  world.addBody(groundBody);

  world.addContactMaterial(groundPlayerCM);
  world.addContactMaterial(tilePlayerCM);

  createMap()
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
}


function updatePhysics(d){
  world.step(fixedTimeStep, d, maxSubSteps)

  for(var i = 0; i < allplayers.length; i++){
    var player = allplayers[i]
    if(player.body){
      // console.log(JSON.stringify(player.body.interpolatedPosition))
      player.display.position.x = player.body.interpolatedPosition[0]//player.body.position[0]
      player.display.position.y = player.body.interpolatedPosition[1]-player.height/2//player.body.position[1]-player.height/2
      // basicText.text = player.display.position.x+" "+player.view.position.x//player.body.position[0]+" "+player.body.position[1]
    }
  }
}
