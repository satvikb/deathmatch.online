var localPlayer;
var allplayers = []

function setupLocalPlayer(data){
  localPlayer = new Player(data.id, data.x, data.y)
  localPlayer.localPlayer = true

  // graphics = new PIXI.Graphics();
  // graphics.beginFill(0xff0000);
  // graphics.drawRect(-localPlayer.shape.width/2, -localPlayer.shape.height/2, localPlayer.shape.width, localPlayer.shape.height);
  // stage.addChild(graphics);
  //

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
