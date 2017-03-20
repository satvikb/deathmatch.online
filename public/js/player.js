function Player(id, x, y){
  this.id = id
  this.localPlayer = false

  this.position = new PIXI.Point();
  this.movespeed = 130
  this.maxVelocityX = 3

  this.animationFrames = [
    PIXI.Texture.fromImage("player_0.png"),
    PIXI.Texture.fromImage("player_1.png"),
    PIXI.Texture.fromFrame("player_2.png"),
    PIXI.Texture.fromFrame("player_3.png")
  ]

  this.view = new PIXI.extras.AnimatedSprite(this.animationFrames)
  this.view.tint = '0x'+Math.floor(Math.random()*16777215).toString(16);
  this.view.animationSpeed = 0
  this.view.anchor.x = 0.5
  this.view.anchor.y = 0.5
  // this.view.scale.x =
  // this.view.scale.y =


  this.position.x = x
  this.position.y = y

  this.previousPosition = new PIXI.Point()//this.position.x, this.position.y)
  this.previousPosition.copy(this.position)

  this.view.play()

  this.velocity = new PIXI.Point()
  this.velocity.x = 0
  this.velocity.y = 0

  this.inputVelocity = new PIXI.Point()
  this.inputVelocity.x = this.inputVelocity.y = 0
}

Player.prototype.liftMove = function(left){
  // if(!left){
  //   this.view.scale.x = -1
  // }else{
  //   this.view.scale.x = 1
  // }
  this.view.gotoAndPlay(0)
}

Player.prototype.startMove = function(left){
  // if(!left){
  //   this.view.scale.x = -1
  // }else{
  //   this.view.scale.x = 1
  // }
  // this.view.gotoAndPlay(0)
  // this.view.loop = true
  this.previousPosition.copy(this.position)
}

Player.prototype.update = function(d){
  //TODO Update collisions
  this.inputVelocity.x = this.inputVelocity.y = 0

  //controls client interploration
  if(this.localPlayer){
    if(left == true){
      this.inputVelocity.x = -this.movespeed*d
    }

    if(right == true){
      this.inputVelocity.x = this.movespeed*d
    }

    this.velocity.x += this.inputVelocity.x

    if(this.velocity.x >= this.maxVelocityX){
      this.velocity.x = this.maxVelocityX
    }
  }

  // this.view.scale.x = this.velocity.x < 0 ? 1 : (this.velocity.x > 0 ? -1 : 1)
  // console.log(this.velocity.x)
  this.view.animationSpeed = (Math.abs(this.velocity.x) / this.maxVelocityX)

  this.position.x += this.velocity.x
  this.position.y += this.velocity.y

  basicText.text = this.previousPosition.x+" "+this.position.x

  var deltaX = this.previousPosition.x-this.position.x
  if(deltaX > 0){
    this.view.scale.x = 1
  }else if(deltaX < 0){
    this.view.scale.x = -1
  }
}
