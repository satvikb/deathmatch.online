var socket;

function initConnection(){
  socket = io.connect("http://localhost:8000")
  socketEventHandlers()
}

function socketEventHandlers(){
  socket.on("connect", socketconnect)
  socket.on("update", update)

  socket.on("joingame", joingame)

  socket.on("newplayer", newplayer)
  // setupLocalPlayer({id:"awawe", x:300, y:300})
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

function update(data){
  // console.log("Update Data: "+data.d.length)
  var d = data.d
  for(var i = 0; i < d.length; i++){
    var playerData = d[i]
    var player = getPlayerById(playerData.id)
    if(player){
      if(player.id == localPlayer.id){
        // basicText.text = player.position.x+" "+player.position.y+"\n"+playerData.position.x+" "+playerData.position.y
      }
      // console.log("U"+player.id+" "+playerData.position.x+" "+playerData.position.y)
      player.position.x = playerData.position.x
      player.position.y = playerData.position.y
    }
  }
}
