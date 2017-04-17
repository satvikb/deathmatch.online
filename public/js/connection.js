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
}

function joingame(data){
  console.log("ID "+data.id)
  curretScene = 1
  map = data.map
  setupWorld()
  setupLocalPlayer(data)
}

//Client connected to page, not game
function socketconnect(data){}

function newplayer(data){
  createNewPlayer(data)
}

function removeplayer(data){
  removePlayerFromScene(data)
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
    var otherPlayer = getPlayerById(pd[0])

    var pos = [pd[1], pd[2]]
    var dir = [pd[3], pd[4]]
    var ph = pd[5] //player health (prop)

    if(otherPlayer){
      otherPlayer.body.position[0] = pos[0]
      otherPlayer.body.position[1] = pos[1]
      otherPlayer.body.previousPosition[0] = pos[0]
      otherPlayer.body.previousPosition[1] = pos[1]

      otherPlayer.display.position.x = otherPlayer.body.position[0]
      otherPlayer.display.position.y = otherPlayer.body.position[1]-otherPlayer.height/2

      otherPlayer.healthBar.setProgress(ph)
      otherPlayer.direction = [dir[0], dir[1]]
      otherPlayer.setArmRotation(dir[0], dir[1])

      if(dir[0] < 0){
        otherPlayer.switchDirection(true)
      }else{
        otherPlayer.switchDirection(false)
      }

      if(otherPlayer.gunLeft){
        if(pd[6] == 0){
          addBullet(otherPlayer, otherPlayer.gunLeft)
        }
      }

      if(otherPlayer.gunRight){
        if(pd[7] == 0){
          addBullet(otherPlayer, otherPlayer.gunRight)
        }
      }
    }
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

    player.display.position.x = player.body.position[0]
    player.display.position.y = player.body.position[1]-player.height/2

    player.healthBar.setProgress(ph)
    player.setArmRotation(dir[0], dir[1])

    if(dir[0] < 0){
      player.switchDirection(true)
    }else{
      player.switchDirection(false)
    }

    if(player.gunLeft){
      if(tpd[6] == 0){
        addBullet(player, player.gunLeft)
      }
    }

    if(player.gunRight){
      if(tpd[7] == 0){
        addBullet(player, player.gunRight)
      }
    }
  }

  var bullets = bulletData
  if(bullets){
    for(var b = 0; b < bullets.length; b++){
      var bullet = bullets[b]
      bulletGraphics.lineStyle(bullet.thickness, bullet.color).moveTo(bullet.displayFrom[0], bullet.displayFrom[1]).lineTo(bullet.displayTo[0], bullet.displayTo[1])
    }
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
