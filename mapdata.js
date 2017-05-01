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

function flipMap(mapInfo){
  var newMap = mapInfo
  var map = []

  for(var x = 0; x < mapInfo.width; x++){
    map.push([])
    for(var y = 0; y < mapInfo.height; y++){
      map[x][mapInfo.height-y] = mapInfo.data[y][x]
    }
  }
  newMap.data = map
  return newMap
}

function GetMapFromId(id){
  // console.log("id "+id)
  // for(var nid in MapData){
  //   var map = MapData[nid]
  //   if(map){
  //     if(map.id == id){
  //       // console.log(nid+" equals "+id)
  //       return flipMap(map)
  //     }
  //   }
  // }
  // console.log("none "+id+" "+Maps.none.id)
  var map = MapData[id]
  if(map){
    return flipMap(map)
  }

  return flipMap(Maps[0]) //Maps.none
}

exports.MapData = MapData
exports.Map = Map
exports.GetMapFromId = GetMapFromId
