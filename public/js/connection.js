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
  socket.on("removeplayer", removeplayer)
  // setupLocalPlayer({id: "awewe", x: 300, y: 300})
}

function joingame(data){
  console.log("joined game "+data.id)
  curretScene = 1
  map = data.map
  // regions = data.regions
  // console.log("region "+regions[0][0].size[1])
  setupWorld()
  setupLocalPlayer(data)
}

//Client connected to page, not game
function socketconnect(data){
  console.log("connect")
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
  bulletGraphics.clear()

  for(var i = 0; i < d.length; i++){
    var playerData = d[i]
    var player = getPlayerById(playerData.id)

    if(playerData.id == localPlayer.id){
      // console.log(";; "+playerData.gunLeftData)
      if(playerData.gunLeftData){
        gunLeftText.text = playerData.gunLeftData.name+": "+playerData.gunLeftData.left+" / "+playerData.gunLeftData.max
      }

      if(playerData.gunRightData){
        gunRightText.text = playerData.gunRightData.name+": "+playerData.gunRightData.left+" / "+playerData.gunRightData.max
      }

      healthText.text = "Health: "+playerData.health.current+" / "+playerData.health.max
      // ammoCounter.text = "Machine Gun: "+playerData.ammoLeft.left+" / "+playerData.ammoLeft.max+"\nShotgun: "+playerData.ammoRight.left+" / "+playerData.ammoRight.max+"\nHealth: "+playerData.health.current+" / "+playerData.health.max
    }

    timerText.text = ":"+playerData.timeLeft/1000

    if(player){
      player.body.position[0] = playerData.position.x
      player.body.position[1] = playerData.position.y
      player.body.previousPosition[0] = playerData.position.x
      player.body.previousPosition[1] = playerData.position.y

      player.display.position.x = player.body.position[0]//player.body.position[0]
      player.display.position.y = player.body.position[1]-player.height/2//player.body.position[1]-player.height/2

      //TODO Health bar

      player.setArmRotation(playerData.direction.x, playerData.direction.y)
    }

    //TODO Merge left gun bullets and right gun bullets
    var bulletsLeft = playerData.bulletsLeftGun
    if(bulletsLeft){
      for(var b = 0; b < bulletsLeft.length; b++){
        var bullet = bulletsLeft[b]
        var from = [bullet[0], bullet[1]]
        var to = [bullet[2], bullet[3]]
        // graphics.position.set()
        bulletGraphics.lineStyle(bullet[4], bullet[5]).moveTo(from[0], from[1]).lineTo(to[0], to[1])
      }
    }

    var bulletsRight = playerData.bulletsRightGun
    if(bulletsRight){
      for(var b = 0; b < bulletsRight.length; b++){
        var bullet = bulletsRight[b]
        var from = [bullet[0], bullet[1]]
        var to = [bullet[2], bullet[3]]
        // graphics.position.set()
        bulletGraphics.lineStyle(bullet[4], bullet[5]).moveTo(from[0], from[1]).lineTo(to[0], to[1])
      }
    }
  }
}
