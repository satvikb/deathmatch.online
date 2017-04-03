var Leaderboard = function(){
  this.sortScore = function(p1, p2){
    return p2.scoreData.score - p1.scoreData.score
  }

  this.getData = function(players){
    var data = []

    //TODO Only send data of the top 3(?)
    for(var i = 0; i < players.length; i++){
      data.push([players[i].clientId, players[i].scoreData.score])
    }
    return data
  }
}

exports.Leaderboard = Leaderboard
