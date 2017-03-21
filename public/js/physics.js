var world = new p2.World({gravity: [0, -9.82]})

world.on('postStep', function(event){
  var leftMove = left == true ? -1 : 0
  var rightMove = right == true ? 1 : 0
  var totalMove = rightMove + leftMove

  if(localPlayer){
    localPlayer.body.velocity[0] = localPlayer.movespeed*totalMove
    // console.log("total "+totalMove+" "+world.time)
  }
})

world.on("impact", function(event){
  console.log("IMPACT")
})

// Create an infinite ground plane body
var groundBody = new p2.Body({
  mass: 0, position: [0, 5] // Setting mass to 0 makes it static
});
var groundShape = new p2.Box({width: size[0], height:1});
groundBody.addShape(groundShape);
world.addBody(groundBody);

var fixedTimeStep = 1 / 60; // seconds
var maxSubSteps = 10; // Max sub steps to catch up with the wall clock

function updatePhysics(d){
  world.step(fixedTimeStep)

  for(var i = 0; i < allplayers.length; i++){
    var player = allplayers[i]
    if(player.body){
      // console.log(JSON.stringify(player.body.interpolatedPosition))
      player.view.position.x = player.body.position[0]
      player.view.position.y = player.body.position[1]
      // basicText.text = player.body.position[0]+" "+player.body.position[1]
    }
  }
}
