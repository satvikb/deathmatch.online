var Bar = function(width, height, options){
  options = options || {}

  this.height = height
  this.width = width

  this.display = new PIXI.Container()
  this.display.scale.y = -1

  var innerColor = options.innerColor || 0xFF0000
  var outerColor = options.outerColor || 0x00FFFF
  var textColor = options.textColor || 0xffffff

  this.innerBar = new PIXI.Graphics()
  this.innerBar.beginFill(innerColor, 0.5)
  this.innerBar.drawRect(0, 0, this.width, this.height)
  this.innerBar.endFill()
  this.display.addChild(this.innerBar)

  this.outerBar = new PIXI.Graphics()
  this.outerBar.beginFill(outerColor, 0.5)
  this.outerBar.drawRect(0, 0, this.width, this.height)
  this.outerBar.endFill()
  this.display.addChild(this.outerBar)
  this.display.outer = this.outerBar

  this.text = new PIXI.Text("", {fill: textColor, fontSize: 52})
  this.text.scale.y = this.scale.x = 0.5
  this.text.height = height
  this.display.addChild(this.text)

  this.hide = function(){
    if(this.display.visible == true){
      this.display.visible = false
    }
  }

  this.show = function(){
    if(this.display.visible == false){
      this.display.visible = true
    }
  }

  this.setProgress = function(progress){
    this.outerBar.width = this.width*progress
  }
}
