var renderer;

var curretScene = 0
var menu;
var stage;

var tileMap;

var hud;
var healthText;
var gunLeftText;
var gunRightText;
var timerText;

var graphics;

function load(){
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

  loader.add(files).on("progress", loadProgress).load(loadFiles)
}

function init(){
  var canvas = document.getElementById("gamecanvas")

  console.log(canvas)
  renderer = PIXI.autoDetectRenderer(size[0], size[1], {view: canvas});

  menu = new Container();
  menu.scale.y = -1
  menu.position.y = size[1]
  menu.displayList = new PIXI.DisplayList()

  setupLobby()


  stage = new Container();
  stage.scale.y = -1
  stage.position.y = size[1]
  stage.displayList = new PIXI.DisplayList()

  graphics = new PIXI.Graphics()
  stage.addChild(graphics)

  tileMap = new Container()
  stage.addChild(tileMap)

  hud = new Container()
  stage.addChild(hud)

  bulletGraphics = new PIXI.Graphics()
  stage.addChild(bulletGraphics)

  healthText = new PIXI.Text('', {fill:0xffffff});
  healthText.text = ""
  healthText.x = 0;
  healthText.y = 100;
  healthText.scale.y = -1
  hud.addChild(healthText)

  gunLeftText = new PIXI.Text('', {fill:0xffffff});
  gunLeftText.text = ""
  gunLeftText.x = 0;
  gunLeftText.y = 200;
  gunLeftText.scale.y = -1
  hud.addChild(gunLeftText)

  gunRightText = new PIXI.Text('', {fill:0xffffff});
  gunRightText.text = ""
  gunRightText.x = 0;
  gunRightText.y = 150;
  gunRightText.scale.y = -1
  hud.addChild(gunRightText)

  timerText = new PIXI.Text('', {fill: 0xffffff})
  timerText.x = size[0]
  timerText.y = size[1]
  timerText.anchor.x = 1
  timerText.anchor.y = 0
  timerText.scale.y = -1
  hud.addChild(timerText)

  resize()
}

function setupLobby(){

  function buttonDown(){
    this.texture = PIXI.Texture.fromImage("button_1.png")
    playText.position.y = 1
  }

  function playBtn(){
    this.texture = PIXI.Texture.fromImage("button_0.png")
    playText.position.y = 0
    socket.emit("joingame")
  }

  var playButton = new PIXI.Sprite(PIXI.Texture.fromImage("button_0.png"))
  playButton.anchor.x = playButton.anchor.y = 0.5
  playButton.position.x = size[0]/2
  playButton.position.y = size[1]/2
  playButton.scale.x = 9
  playButton.scale.y = -9
  playButton.interactive = true
  playButton.on('mousedown', buttonDown).on("mouseup", playBtn).on("mouseupoutside", function(){
    this.texture = PIXI.Texture.fromImage("button_0.png")
    playText.position.y = 0
  })

  var playText = new PIXI.Text("Play", {fill: 0xFFFFFF, fontSize: 8})
  playText.anchor.x = playText.anchor.y = 0.5
  // playText.x = -playButton.width/2/playButton.scale.x
  // playText.y = playButton.height/2/playButton.scale.y
  console.log("asdfa "+playButton.width/2+" "+playButton.height/2+" "+playText.fontSize)
  playButton.addChild(playText)

  var titleText = new PIXI.Text("deathmatch.online", {fill: 0xFFFFFF})
  titleText.anchor.x = 0.5
  titleText.anchor.y = -0.5
  titleText.position.x = size[0]/2
  titleText.position.y = size[1]
  titleText.scale.x = 5
  titleText.scale.y = -5

  menu.addChild(titleText)
  menu.addChild(playButton)
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

  if(curretScene == 1){
    if(localPlayer){
      localPlayer.update(delta)
      socket.emit("input", {left:left, right: right, jump: jump, shootLeft: shootLeft, shootRight: shootRight, direction: localPlayer.direction})
    }

    updatePhysics(delta)

    renderer.render(stage)
  }else if(curretScene == 0){
    renderer.render(menu)
  }
  // setTimeout(gameLoop, 1/60)
  time = Date.now()
}

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

load()
// music()
