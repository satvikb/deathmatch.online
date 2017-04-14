var socket;

function initConnection(){
  socket = io.connect("http://deathmatch.online")
  socketEventHandlers()
}

function socketEventHandlers(){
  socket.on("connect", socketconnect)
  socket.on("u", update)

  socket.on("jg", joingame)

  socket.on("np", newplayer)
  socket.on("rp", removeplayer)

  
  // setupLocalPlayer({id: "awewe", x: 300, y: 300})
}

function joingame(data){
  console.log("ID "+data.id)
  curretScene = 1
  map = data.map
  setupWorld()
  setupLocalPlayer(data)
}

//Client connected to page, not game
function socketconnect(data){

}

function newplayer(data){
  createNewPlayer(data)
}

function removeplayer(data){
  removePlayerFromScene(data)
}

function gotScore(data){
  var newScore = data.score
  var change = data.add

  //TODO Show text or something for score changes e.g. showing where a hit is with score text "+5"
}

function update(data){
  var d = data
  bulletGraphics.clear()

  var roundProgress = d.gs[0]
  var secondRoundLeft = roundProgress*60
  timerText.text = ""+Math.round(secondRoundLeft * 100) / 100
  timerBar.setProgress(roundProgress)


  updateLeaderboard(d.gs[1])

  for(var i = 0; i < d.op.length; i++){
    var pd = d.op[i]
    var player = getPlayerById(pd[0])

    // var meta = playerData.m
    var pos = [pd[1], pd[2]]
    var dir = [pd[3], pd[4]]
    var ph = pd[5] //player health (prop)

    if(player){
      player.body.position[0] = pos[0]
      player.body.position[1] = pos[1]
      player.body.previousPosition[0] = pos[0]
      player.body.previousPosition[1] = pos[1]

      player.display.position.x = player.body.position[0]//player.body.position[0]
      player.display.position.y = player.body.position[1]-player.height/2//player.body.position[1]-player.height/2

      player.healthBar.setProgress(ph)//outer.width = (playerData.health.current/playerData.health.max)*player.healthBarWidth;//healthBar.width

      player.setArmRotation(dir[0], dir[1])
      if(dir[0] < 0){
        player.switchDirection(true)
      }else(
        player.switchDirection(false)
      )
    }

    //TODO Merge left gun bullets and right gun bullets
    //TODO Show bullet shots from the client by broadcasting a shoot message from each client
    // var bulletsLeft = playerData.bulletsLeftGun
    // if(bulletsLeft){
    //   for(var b = 0; b < bulletsLeft.length; b++){
    //     var bullet = bulletsLeft[b]
    //     var from = [bullet[0], bullet[1]]
    //     var to = [bullet[2], bullet[3]]
    //     // graphics.position.set()
    //     bulletGraphics.lineStyle(bullet[4], bullet[5]).moveTo(from[0], from[1]).lineTo(to[0], to[1])
    //   }
    // }
    //
    // var bulletsRight = playerData.bulletsRightGun
    // if(bulletsRight){
    //   for(var b = 0; b < bulletsRight.length; b++){
    //     var bullet = bulletsRight[b]
    //     var from = [bullet[0], bullet[1]]
    //     var to = [bullet[2], bullet[3]]
    //     // graphics.position.set()
    //     bulletGraphics.lineStyle(bullet[4], bullet[5]).moveTo(from[0], from[1]).lineTo(to[0], to[1])
    //   }
    // }
  }

  var tpd = d.p
  var player = localPlayer
  var pos = [tpd[1], tpd[2]]
  var dir = [tpd[3], tpd[4]]
  var ph = tpd[5] //player health (prop)

  if(player){
    player.body.position[0] = pos[0]
    player.body.position[1] = pos[1]
    player.body.previousPosition[0] = pos[0]
    player.body.previousPosition[1] = pos[1]

    player.display.position.x = player.body.position[0]//player.body.position[0]
    player.display.position.y = player.body.position[1]-player.height/2//player.body.position[1]-player.height/2

    player.healthBar.setProgress(ph)//outer.width = (playerData.health.current/playerData.health.max)*player.healthBarWidth;//healthBar.width

    player.setArmRotation(dir[0], dir[1])
    if(dir[0] < 0){
      player.switchDirection(true)
    }else(
      player.switchDirection(false)
    )
  }

  if(d.gl){
    var gun = GetGunFromId(d.gl[0])

    gunLeftBar.show()
    gunLeftBar.text.text = gun.name+": "+d.gl[1]+" / "+gun.ammo.maxAmmo
    gunLeftBar.setProgress(d.gl[1]/gun.ammo.maxAmmo)
  }else{
    gunLeftBar.hide()
  }

  if(d.gr){
    var gun = GetGunFromId(d.gr[0])

    gunRightBar.show()
    gunRightBar.text.text = gun.name+": "+d.gr[1]+" / "+gun.ammo.maxAmmo
    gunRightBar.setProgress(d.gr[1]/gun.ammo.maxAmmo)
  }else{
    gunRightBar.hide()
  }

}

function updateLeaderboard(data){
  // console.log("LB: "+data)

  for(var i = 0; i < data.length; i++){
    if(i < leaderboardTexts.length){
      var leaderboardData = data[i]
      var player = getPlayerById(leaderboardData[0])

      if(player){
        leaderboardTexts[i].text = ""+player.nickname+" "+leaderboardData[1]
      }else{
        leaderboardTexts[i].text = ""
      }
    }else{
      return;
    }
  }
}
