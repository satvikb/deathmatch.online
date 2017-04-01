var localPlayer;
var allplayers = []

function setupLocalPlayer(data){
  localPlayer = new Player(data.id, data.nickname, data.x, data.y)
  localPlayer.localPlayer = true
  stage.addChild(localPlayer.display)
  allplayers.push(localPlayer)
}

function createNewPlayer(data){
  var player = new Player(data.id, data.nickname, data.x, data.y)
  stage.addChild(player.display)
  allplayers.push(player)
}

function removePlayerFromScene(data){
  var player = getPlayerById(data.id)
  allplayers.splice(allplayers.indexOf(player), 1);
  // allplayers.remove(player)
  console.log("removing player "+player+" "+data.id)
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
