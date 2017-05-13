function Player(clientId, nickname, x, y, gunLeftId, gunRightId){
  this.clientId = clientId
  this.nickname = nickname
  this.localPlayer = false

  this.gunLeftId = gunLeftId
  this.gunRightId = gunRightId

  this.gunLeft = CloneGun(GetGunFromId(gunLeftId))
  this.gunRight = CloneGun(GetGunFromId(gunRightId))

  this.movespeed = 150
  this.jumpheight = 550

  this.sizeMultiplier = 3
  this.width = gameData.texturedata["player"]["width"]*this.sizeMultiplier
  this.height = gameData.texturedata["player"]["height"]*this.sizeMultiplier

  this.animationFrames = [
    PIXI.Texture.fromImage("player_0.png"),
    PIXI.Texture.fromImage("player_1.png"),
    PIXI.Texture.fromFrame("player_2.png"),
    PIXI.Texture.fromFrame("player_3.png"),
    PIXI.Texture.fromFrame("player_4.png"),
    PIXI.Texture.fromFrame("player_5.png"),
    PIXI.Texture.fromFrame("player_6.png")
  ]

  this.display = new PIXI.Container()

  this.healthBar = new Bar(this.width*1.5, 8)
  this.healthBar.display.position.set(-(this.healthBar.width/2), this.height+(this.healthBar.height*2))
  this.display.addChild(this.healthBar.display)

  this.bodyLayer = new PIXI.DisplayGroup(0, false)
  this.gunRightLayer = new PIXI.DisplayGroup(1, true)
  this.gunLeftLayer = new PIXI.DisplayGroup(-1, true)

  this.nicknameView = new PIXI.Text(nickname, {fill: 0xffffff, fontSize: 15, align: "center"})
  this.nicknameView.x = -this.width/2
  this.nicknameView.y = this.height*1.5
  this.nicknameView.anchor.x = 0
  this.nicknameView.anchor.y = 0
  this.nicknameView.scale.y = -1
  this.display.addChild(this.nicknameView)

  this.view = new PIXI.extras.AnimatedSprite(this.animationFrames)
  this.view.tint = '0xffffff'//+Math.floor(Math.random()*16777215).toString(16); // Random Tint
  this.view.animationSpeed = 0
  this.view.anchor.x = 0.5
  this.view.anchor.y = 1
  this.view.scale.y = -3
  this.view.scale.x = 3
  this.view.zOrder = 0
  this.view.displayGroup = this.bodyLayer
  this.display.addChild(this.view)

  this.armY = 32
  this.armYBack = 28

  this.armScale = (6/16)

  this.gunLeftTex = new PIXI.Sprite(PIXI.Texture.fromImage("gun_0.png"))//.fromImage("arm.png")
  // this.armLeft.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
  this.gunLeftTex.anchor.x = 0.5
  this.gunLeftTex.anchor.y = 0
  this.gunLeftTex.scale.y = -this.armScale
  this.gunLeftTex.scale.x = this.armScale
  this.gunLeftTex.position.y = this.armY
  this.gunLeftTex.displayGroup = this.gunLeftLayer
  this.gunLeftLayer.zOrder = -1
  this.display.addChild(this.gunLeftTex)

  this.gunRightTex = new PIXI.Sprite(PIXI.Texture.fromImage("gun_1.png"))
  // this.armRight.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.LINEAR;
  this.gunRightTex.anchor.x = 0.5
  this.gunRightTex.anchor.y = 0
  this.gunRightTex.scale.y = -this.armScale
  this.gunRightTex.scale.x = this.armScale
  this.gunRightTex.position.y = this.armY
  this.gunRightTex.displayGroup = this.gunRightLayer
  this.gunRightLayer.zOrder = 100
  this.display.addChild(this.gunRightTex)

  this.view.play()

  this.body
  this.shape
  this.direction = [-1, 0]

  this.getPos = function(){
    if(this.body){
      return this.body.position
    }
    return [0, 0]
  }

  this.createBody = function(mass, posX, posY, width, height){
    this.body = new p2.Body({mass: mass, position: [posX, posY], fixedRotation: false, damping: 0})
    this.shape = new p2.Box({width: width, height: height, material: playerMaterial})
    this.body.addShape(this.shape)
    world.addBody(this.body)
  }

  this.liftMove = function(left){
    this.view.gotoAndPlay(0)
  }

  this.startMove = function(left){

  }

  this.mouseMove = function(x, y){
    if(localPlayer){
      var sx = this.display.position.x*scaleBy

      if(x > sx){
        this.switchDirection(false)
      }else if(x < sx){
        this.switchDirection(true)
      }

      var sy = (this.display.position.y*scaleBy)+(this.armY*scaleBy)

      //TODO Move into update function? Only updating direction if mouse moves for now...
      var dirX = x-sx
      var dirY = (sh-y)-sy
      var uV = normDir([dirX, dirY])

      this.direction = uV

      this.setArmRotation(uV[0], uV[1])
    }
  }

  this.switchDirection = function(left){
    if(left){
      this.view.scale.x = -3
      this.gunLeftTex.scale.x = -this.armScale
      this.gunLeftLayer.zOrder = 4
      this.gunLeftTex.position.y = this.armYBack

      this.gunRightTex.scale.x = -this.armScale
      this.gunRightLayer.zOrder = -4
      this.gunRightTex.position.y = this.armY
    }else{
      this.view.scale.x = 3
      this.gunLeftTex.scale.x = this.armScale
      this.gunLeftLayer.zOrder = -4
      this.gunLeftTex.position.y = this.armYBack

      this.gunRightTex.scale.x = this.armScale
      this.gunRightLayer.zOrder = 4
      this.gunRightTex.position.y = this.armY
    }
  }

  this.setArmRotation = function(dirX, dirY){
    // this.direction = [dirX, dirY]

    var rot = Math.atan2(dirY, dirX)

    this.gunLeftTex.rotation = rot+Math.PI/2 //TODO Figure out why we need to add pi/2
    this.gunRightTex.rotation = rot+Math.PI/2
  }

  this.update = function(d){
    this.view.animationSpeed = (Math.abs(this.body.velocity[0]) / (this.movespeed*10))
  }

  this.canJump = function(){
    for(var i = 0; i < world.narrowphase.contactEquations.length; i++){
      var c = world.narrowphase.contactEquations[i];
      if(c.bodyA === this.body || c.bodyB === this.body){
        var d = c.normalA[1];
        if(c.bodyA === this.body) d *= -1;
        if(d > 0.5) return true;
      }
    }
    return false;
  }

  this.createBody(1, x+this.width/2, y-this.height/2, this.width, this.height)
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
