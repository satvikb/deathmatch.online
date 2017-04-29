var fs = require('fs')

var GameData = function(){
  if(GameData.setup == undefined){
    GameData.setup = true

    GameData.json = JSON.parse(fs.readFileSync('public/data/game.json', 'utf8'))
    GameData.rawdata = GameData.json["data"]
    GameData.metadata = GameData.json["data"]["metadata"]
    GameData.gamedata = GameData.json["data"]["gamedata"]

    console.log("Loaded data. "+GameData.metadata["version"])
  }
}

exports.GameData = GameData
