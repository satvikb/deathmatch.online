function Player(){
  this.position = new PIXI.Point();
  this.movespeed = 400

  this.animationFrames = [
    id["player_0.png"],
    id["player_1.png"],
    id["player_2.png"],
    id["player_3.png"]
  ]

  this.view = new PIXI.MovieClip(this.animationFrames)
  this.view.animationSpeed = 0
  this.view.anchor.x = 0.5
  this.view.anchor.y = 0.5
  this.view.scale.x = 30
  this.view.scale.y = 30


  this.position.y = 300
  this.position.x = 300

  this.view.play()

  this.velocity = new PIXI.Point()
  this.velocity.x = 0
  this.velocity.y = 0

  this.inputVelocity = new PIXI.Point()
  this.inputVelocity.x = this.inputVelocity.y = 0
}

var time = Date.now()

Player.prototype.update = function(){
  var d = (Date.now()-time)/1000
  d *= 0.1
  //TODO Update collisions
  this.inputVelocity.x = this.inputVelocity.y = 0
  this.velocity.x = 0
  this.velocity.y += 9*d

  //controls
  if(left == true){
    this.inputVelocity.x = -this.movespeed*d
  }

  if(right == true){
    this.inputVelocity.x = this.movespeed*d
  }
  this.velocity.x += this.inputVelocity.x

  this.position.x += this.velocity.x
  this.position.y += this.velocity.y


  this.view.position = this.position
  if(this.view.position.y > 700){
    this.view.position.y = 700
  }


  time = Date.now()
}
