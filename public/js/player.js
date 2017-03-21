function Player(id, x, y){
  this.id = id
  this.localPlayer = false

  // this.position = new PIXI.Point();
  this.movespeed = 30
  // this.maxVelocityX = 3

  this.animationFrames = [
    PIXI.Texture.fromImage("player_0.png"),
    PIXI.Texture.fromImage("player_1.png"),
    PIXI.Texture.fromFrame("player_2.png"),
    PIXI.Texture.fromFrame("player_3.png")
  ]

  this.view = new PIXI.extras.AnimatedSprite(this.animationFrames)
  this.view.tint = '0xffffff'//+Math.floor(Math.random()*16777215).toString(16); // Random Tint
  this.view.animationSpeed = 0
  this.view.anchor.x = 0.5
  this.view.anchor.y = 0.5
  this.view.scale.y = -1
  this.previousPosition = [x, y]//this.position.x, this.position.y)
  // this.previousPosition.copy(this.position)

  this.view.play()

  this.body
  this.shape

  this.getPos = function(){
    if(this.body){
      return this.body.position
    }
    return [0, 0]
  }

  this.createBody = function(mass, x, y, width, height){
    this.body = new p2.Body({mass: mass, position: [x, y], fixedRotation: true, damping: 0.5})
    this.shape = new p2.Box({width: width, height: height})
    this.body.addShape(this.shape)
    world.addBody(this.body)
    console.log("New body")
  }

  this.liftMove = function(left){
    this.view.gotoAndPlay(0)
  }

  this.startMove = function(left){
    
  }

  this.mouseMove = function(x, y){
    var sx = this.view.position.x*scaleBy
    if(x > sx+this.view.width/2){
      this.view.scale.x = -1
    }else if(x < sx+this.view.width/2){
      this.view.scale.x = 1
    }
    basicText.text = x+" "+this.view.x+" "+sx
  }

  this.update = function(d){
    this.view.animationSpeed = (Math.abs(this.body.velocity[0]) / this.movespeed)
  }

  this.createBody(1, x, y, 5, 5)
  console.log(this.body)
}
