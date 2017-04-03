var IDHandler = function(){
  this.currentIDs = []
  this.idLength = 1;

  this.generateID = function(){
    var id;

    if(id == undefined){
      id = this.randomString(this.idLength)
      while(this.currentIDs.indexOf(id) > -1){
        id = this.randomString(this.idLength)
      }
    }
    this.currentIDs.push(id)
    return id
  }

  this.randomString = function(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-=;.,/`~|";

    for(var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

exports.IDHandler = IDHandler
