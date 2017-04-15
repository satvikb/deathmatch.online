var localPlayer;
var allplayers = []

function setupLocalPlayer(data){
  localPlayer = new Player(data.id, data.nickname, data.x, data.y, data.gunL, data.gunR)
  localPlayer.localPlayer = true
  stage.addChild(localPlayer.display)
  allplayers.push(localPlayer)
}

function createNewPlayer(data){
  var player = new Player(data.id, data.nickname, data.x, data.y, data.gunL, data.gunR)
  stage.addChild(player.display)
  allplayers.push(player)
}

function removePlayerFromScene(data){
  var player = getPlayerById(data.id)

  if(player){
    allplayers.splice(allplayers.indexOf(player), 1);

    stage.removeChild(player.display)
    world.removeBody(player.body)
  }
}

function getPlayerById(id){
  for(var i = 0; i < allplayers.length; i++){
    if(allplayers[i].clientId == id){
      return allplayers[i]
    }
  }
  return null
}
