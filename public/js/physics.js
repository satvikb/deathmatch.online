var world = new p2.World({gravity: [0, -500]})
world.defaultContactMaterial.friction = 0.5
// world.setGlobalStiffness(1e5)

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

world.on("impact", function(event){
  // console.log("IMPACT")
})

var groundMaterial = new p2.Material();
var playerMaterial = new p2.Material();

var groundSize = [size[0], 1]
var groundPos = [groundSize[0]/2, groundSize[1]/2]
// Create an infinite ground plane body
var groundBody = new p2.Body({
  mass: 0, position: groundPos // Setting mass to 0 makes it static
});

var groundShape = new p2.Box({width: groundSize[0], height: groundSize[1], material: groundMaterial});
groundBody.addShape(groundShape);
world.addBody(groundBody);

var groundCharacterCM = new p2.ContactMaterial(groundMaterial, playerMaterial,{
 friction : 0,
});

world.addContactMaterial(groundCharacterCM);

var fixedTimeStep = 1/60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock

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
