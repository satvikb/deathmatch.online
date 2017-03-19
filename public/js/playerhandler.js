var localPlayer;
var allplayers = []

function setupLocalPlayer(data){
  console.log("local player "+data.id+" "+data.x+" "+data.y)
  localPlayer = new Player(data.id, data.x, data.y)
  localPlayer.localPlayer = true
  stage.addChild(localPlayer.view)
  allplayers.push(localPlayer)

}

function createNewPlayer(data){
  var player = new Player(data.id, data.x, data.y)
  stage.addChild(player.view)
  allplayers.push(player)
}

function getPlayerById(id){
  for(var i = 0; i < allplayers.length; i++){
    if(allplayers[i].id == id){
      return allplayers[i]
    }
  }
  return null
}
