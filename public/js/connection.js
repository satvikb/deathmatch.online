var socket;

function initConnection(){
  socket = io.connect("http://192.168.1.8:8000")
  socketEventHandlers()
}

function socketEventHandlers(){
  socket.on("connect", socketconnect)
  socket.on("update", update)

  socket.on("joingame", joingame)

  socket.on("newplayer", newplayer)
  socket.on("removeplayer", removeplayer)
  // setupLocalPlayer({id: "awewe", x: 300, y: 300})
}

function joingame(data){
  console.log("joined game "+data.id)
  setupLocalPlayer(data)
}

//Client connected to page, not game
function socketconnect(data){
  console.log("connect")
  //TODO Move to lobby
  socket.emit("joingame")
}

function newplayer(data){
  console.log("New player!! "+data.id)
  createNewPlayer(data)
}

function removeplayer(data){
  removePlayerFromScene({id: data.id})
}

function update(data){
  var d = data.d
  graphics.clear()

  for(var i = 0; i < d.length; i++){
    var playerData = d[i]
    var player = getPlayerById(playerData.id)
    if(player){
      player.body.position[0] = playerData.position.x
      player.body.position[1] = playerData.position.y
      player.body.previousPosition[0] = playerData.position.x
      player.body.previousPosition[1] = playerData.position.y
    }

    var bullets = playerData.testBullet

    for(var b = 0; b < bullets.length; b++){
      var bullet = bullets[b]
      var from = [bullet[0], bullet[1]]
      var to = [bullet[2], bullet[3]]
      // graphics.position.set()
      graphics.lineStyle(bullet[4], bullet[5]).moveTo(from[0], from[1]).lineTo(to[0], to[1])
    }
  }
}
