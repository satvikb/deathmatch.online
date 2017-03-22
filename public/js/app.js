var renderer;
var stage;
var basicText;
var graphics;

function init(){
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

  var canvas = document.getElementById("gamecanvas")

  console.log(canvas)
  renderer = PIXI.autoDetectRenderer(size[0], size[1], {view: canvas});

  // Create a container object called the `stage`
  stage = new Container();
  stage.scale.y = -1
  stage.position.y = size[1]

  basicText = new PIXI.Text('Basic text in pixi', {fill:0xffffff});
  basicText.text = "Test"
  basicText.x = 0;
  basicText.y = 1040;
  basicText.scale.y = -1

  stage.addChild(basicText)




  loader.add(files).on("progress", loadProgress).load(loadFiles)

  resize()
}

var ratio = size[0] / size[1];
var scaleBy;
var sw,sh; //scaled width and height
function resize() {
  if (window.innerWidth / window.innerHeight >= ratio) {
    var w = window.innerHeight * ratio;
    var h = window.innerHeight;
  } else {
    var w = window.innerWidth;
    var h = window.innerWidth / ratio;
  }
  renderer.view.style.width = w + 'px';
  renderer.view.style.height = h + 'px';
  scaleBy = h/size[1]
  sw = w
  sh = h
}

window.onresize = function(event) {
    resize();
};

var time = Date.now()

function gameLoop(){
  var d = (Date.now()-time)/1000

  requestAnimationFrame(gameLoop);

  if(localPlayer){
    localPlayer.update(d)
    // socket.emit("input", {left:left, right: right})
  }

  updatePhysics(d)

  renderer.render(stage)

  // if(graphics){
  //   graphics.position.x = localPlayer.body.position[0];//-localPlayer.width/2;
  //   graphics.position.y = localPlayer.body.position[1];
  //   graphics.rotation =   localPlayer.body.angle;
  // }

  time = Date.now()
}

function inputLoop(){
  if(localPlayer){
    // socket.emit("input", {left:left, right: right})
  }
  // setTimeout(inputLoop, 1/30)
}


init()
