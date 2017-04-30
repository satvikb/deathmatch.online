var fs = require('fs')

var MapData = function(){
  if(MapData.setup == undefined){
    MapData.setup = true

    MapData.none = null

    var mapdata = JSON.parse(fs.readFileSync('public/data/maps.json', 'utf8'))["maps"]
    for(var i = 0; i < mapdata.length; i++){
      var d = mapdata[i]
      MapData[d.id] = new Map(d.id, d.name, d.data)
    }

    console.log("Loaded data. "+MapData[0].name)
  }
}


function Map(id, name, data){
  this.id = id
  this.name = name
  this.data = data
  this.height = data.length
  this.width = data[0].length
}

function GetMapFromId(id){
  // console.log("id "+id)
  for(var nid in MapData){
    var map = MapData[nid]
    if(map){
      if(map.id == id){
        // console.log(nid+" equals "+id)
        return map
      }
    }
  }
  // console.log("none "+id+" "+Maps.none.id)

  return Maps.none
}

exports.MapData = MapData
exports.Map = Map
exports.GetMapFromId = GetMapFromId