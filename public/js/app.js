var renderer;
var stage;

var tileMap;

var hud;
var ammoCounter;

var graphics;

function init(){
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

  var canvas = document.getElementById("gamecanvas")

  console.log(canvas)
  renderer = PIXI.autoDetectRenderer(size[0], size[1], {view: canvas});

  // Create a container object called the `stage`
  stage = new Container();
  stage.scale.y = -1
  stage.position.y = size[1]
  stage.displayList = new PIXI.DisplayList()

  tileMap = new Container()
  stage.addChild(tileMap)

  hud = new Container()
  stage.addChild(hud)

  graphics = new PIXI.Graphics()
  stage.addChild(graphics)

  ammoCounter = new PIXI.Text('', {fill:0xffffff});
  ammoCounter.text = ""
  ammoCounter.x = 0;
  ammoCounter.y = 1040;
  ammoCounter.scale.y = -1
  hud.addChild(ammoCounter)

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
var delta;
function gameLoop(){
  delta = (Date.now()-time)/1000

  requestAnimationFrame(gameLoop);

  if(localPlayer){
    localPlayer.update(delta)
    socket.emit("input", {left:left, right: right, jump: jump, shootLeft: shootLeft, shootRight: shootRight, direction: localPlayer.direction})
  }

  updatePhysics(delta)

  renderer.render(stage)
  // setTimeout(gameLoop, 1/60)

  time = Date.now()
}

function animate(){
}

// function inputLoop(){
//   if(localPlayer){
//     // socket.emit("input", {left:left, right: right})
//   }
//   // setTimeout(inputLoop, 1/30)
// }

function music(){
  soundEffect(
    getRandomInt(10, 1000),
    0,
    0.1,
    "sine",
    1,
    getRandomInt(0, 100) < 50 ? -1 : 1,
    0,
    0,
    false,
    50,
    2,
    undefined,
    undefined
  );

  setTimeout(music, getRandomInt(100, 1000))
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


init()
// music()
