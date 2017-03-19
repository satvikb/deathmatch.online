var gravity = 9

function updatePhysics(d){
  for(var i = 0; i < allplayers.length; i++){
    var player = allplayers[i];

    player.velocity.x = 0
    player.velocity.y += gravity*d


    if(player.position.y > 500){
      player.position.y = 500
    }

    player.view.position = player.position
  }
}
