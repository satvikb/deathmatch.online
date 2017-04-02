var socket;

function initConnection(){
  socket = io.connect("http://deathmatch.online")
  socketEventHandlers()
}

function socketEventHandlers(){
  socket.on("connect", socketconnect)
  socket.on("update", update)

  socket.on("joingame", joingame)

  socket.on("score", gotScore)
  socket.on("leaderboard", updateLeaderboard)

  socket.on("newplayer", newplayer)
  socket.on("removeplayer", removeplayer)
  // setupLocalPlayer({id: "awewe", x: 300, y: 300})
}

function joingame(data){
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
  removePlayerFromScene({id: data.id})
}

function gotScore(data){
  var newScore = data.score
  var change = data.add

  //TODO Show text or something for score changes e.g. showing where a hit is with score text "+5"
}

function update(data){
  var d = data.d
  bulletGraphics.clear()

  for(var i = 0; i < d.length; i++){
    var playerData = d[i]
    var player = getPlayerById(playerData.id)

    if(playerData.id == localPlayer.id){
      if(playerData.gunLeftData){
        gunLeftBar.show()
        gunLeftBar.text.text = playerData.gunLeftData.name+": "+playerData.gunLeftData.left+" / "+playerData.gunLeftData.max
        gunLeftBar.setProgress(playerData.gunLeftData.left/playerData.gunLeftData.max)
      }else{
        gunLeftBar.hide()
      }

      if(playerData.gunRightData){
        gunRightBar.show()
        gunRightBar.text.text = playerData.gunRightData.name+": "+playerData.gunRightData.left+" / "+playerData.gunRightData.max
        gunRightBar.setProgress(playerData.gunRightData.left/playerData.gunRightData.max)
      }else{
        gunRightBar.hide()
      }
    }

    var secondRoundLeft = playerData.timeLeft/1000
    timerText.text = ""+Math.round(secondRoundLeft * 100) / 100
    timerBar.setProgress(playerData.roundProgress)

    if(player){

      player.body.position[0] = playerData.position.x
      player.body.position[1] = playerData.position.y
      player.body.previousPosition[0] = playerData.position.x
      player.body.previousPosition[1] = playerData.position.y

      player.display.position.x = player.body.position[0]//player.body.position[0]
      player.display.position.y = player.body.position[1]-player.height/2//player.body.position[1]-player.height/2

      player.healthBar.setProgress(playerData.health.current/playerData.health.max)//outer.width = (playerData.health.current/playerData.health.max)*player.healthBarWidth;//healthBar.width

      player.setArmRotation(playerData.direction.x, playerData.direction.y)
      if(playerData.direction.x < 0){
        player.switchDirection(true)
      }else(
        player.switchDirection(false)
      )
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

function updateLeaderboard(data){
  // console.log("LB: "+playerData.leaderboard)

  for(var i = 0; i < data.length; i++){
    if(i < leaderboardTexts.length){
      var leaderboardData = data[i]
      var player = getPlayerById(leaderboardData.id)

      if(player){
        leaderboardTexts[i].text = ""+player.nickname+" "+leaderboardData.score
      }else{
        leaderboardTexts[i].text = ""
      }
    }else{
      return;
    }
  }
}
