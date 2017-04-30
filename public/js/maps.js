var Maps = {}

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

function GetMapFromId(id){
  for(var id in Maps){
    var map = Maps[id]
    if(map){
      if(map.id == id){
        return map
      }
    }
  }
  return Maps.none
}
