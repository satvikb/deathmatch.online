function Player(id, x, y){
  this.id = id
  this.localPlayer = false

  // this.position = new PIXI.Point();
  this.movespeed = 8
  // this.maxVelocityX = 3

  this.width = 16
  this.height = 64

  this.animationFrames = [
    PIXI.Texture.fromImage("player_0.png"),
    PIXI.Texture.fromImage("player_1.png"),
    PIXI.Texture.fromFrame("player_2.png"),
    PIXI.Texture.fromFrame("player_3.png")
  ]

  this.display = new PIXI.Container()

  this.view = new PIXI.extras.AnimatedSprite(this.animationFrames)
  this.view.tint = '0xffffff'//+Math.floor(Math.random()*16777215).toString(16); // Random Tint
  this.view.animationSpeed = 0
  this.view.anchor.x = 0.5
  this.view.anchor.y = 1
  this.view.scale.y = -1
  this.display.addChild(this.view)

  this.arm = PIXI.Sprite.fromImage("arm.png")
  this.arm.anchor.x = 0.5
  this.arm.anchor.y = 0
  this.arm.scale.y = -(8/36)
  this.arm.scale.x = (8/36)
  this.arm.position.y = 39
  this.display.addChild(this.arm)

  this.view.play()

  this.body
  this.shape

  this.getPos = function(){
    if(this.body){
      return this.body.position
    }
    return [0, 0]
  }

  this.createBody = function(mass, posX, posY, width, height){
    this.body = new p2.Body({mass: mass, position: [posX, posY], fixedRotation: true, damping: 0})
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
    var sx = this.display.position.x*scaleBy
    var sy = this.display.position.y*scaleBy

    if(x > sx+this.display.width/2){
      this.view.scale.x = -1
      this.arm.scale.x = -1
    }else if(x < sx+this.display.width/2){
      this.view.scale.x = 1
      this.arm.scale.x = 1
    }

    var dirX = x-sx
    var dirY = sh-(y-(sy-this.height/4)) //center y
    var uV = normDir([dirX, dirY])
    var rot = Math.atan2(uV[1], uV[0])
    this.arm.rotation = rot+Math.PI/2
    basicText.text = dirX+" "+dirY+" "+uV[0]+" "+uV[1]
  }

  this.update = function(d){
    this.view.animationSpeed = (Math.abs(this.body.velocity[0]) / this.movespeed*3)
  }

  this.createBody(150, x+this.width/2, y-this.height/2, this.width, this.height)
}

function normDir(dir){
  var x = dir[0]
  var y = dir[1]

  var s = Math.sqrt(x * x + y * y);
  if(s === 0) {
      x = 0;
      y = 0;
  } else {
      var invScalar = 1 / s;
      x *= invScalar;
      y *= invScalar;
  }
  return [x,y];
}
