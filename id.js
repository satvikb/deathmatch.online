var utils = require('./util.js').utils

var IDHandler = function(){
  this.currentIDs = []
  this.idLength = 1;

  this.generateID = function(){
    var id;

    if(id == undefined){
      id = utils.randomString(this.idLength)
      while(this.currentIDs.indexOf(id) > -1){
        id = utils.randomString(this.idLength)
      }
    }
    this.currentIDs.push(id)
    return id
  }
}

exports.IDHandler = IDHandler
