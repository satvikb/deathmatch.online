var localPlayer;
var allplayers = []

function setupLocalPlayer(data){
  localPlayer = new Player(data.id, data.x, data.y)
  localPlayer.localPlayer = true
  stage.addChild(localPlayer.display)
  allplayers.push(localPlayer)
}

function createNewPlayer(data){
  var player = new Player(data.id, data.x, data.y)
  stage.addChild(player.display)
  allplayers.push(player)
}

function removePlayerFromScene(data){
  var player = getPlayerById(data.id)
  allplayers.remove(player)
  stage.removeChild(player.display)
  world.removeBody(player.body)
}

function getPlayerById(id){
  for(var i = 0; i < allplayers.length; i++){
    if(allplayers[i].id == id){
      return allplayers[i]
    }
  }
  return null
}
