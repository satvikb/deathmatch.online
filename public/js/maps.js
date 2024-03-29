var Maps = {}
var currentMapId = 0

function initMaps(){
  Maps.none = null

  var data = mapsJson["maps"]
  for(var i = 0; i < data.length; i++){
    var d = data[i]
    Maps[d.id] = new Map(d.id, d.name, d.data)
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
  var newMap = new Map(mapInfo.id, mapInfo.name, mapInfo.data)
  var map = []

  for(var x = 0; x < mapInfo.width; x++){
    map.push([])
    for(var y = 0; y < mapInfo.height; y++){
      map[x][mapInfo.height-1-y] = mapInfo.data[y][x]
    }
  }
  newMap.data = map
  return newMap
}

function GetMapFromId(id){
  var map = Maps[id]

  if(map){
    return flipMap(map)
  }
  // for(var id in Maps){
  //   var map = Maps[id]
  //   if(map){
  //     if(map.id == id){
  //       return flipMap(map)
  //     }
  //   }
  // }
  console.log("none")
  return flipMap(Maps[0])//Maps.none
}
