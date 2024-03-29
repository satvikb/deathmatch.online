var canvas;
var renderer;

var curretScene = 0
var menu;
var stage;

var tileMap;
var hud;
var leaderboard;

var leaderboardTexts = []

var timerBar;
var gunLeftBar;
var gunRightBar;
var timerText;
var scoreText;

var roundIntermission;
var newRoundCountdown;
var newRoundBar;
var roundIntermissionLeaderboard;
var roundIntermissionLeaderboardTexts = [];

// var roundLeaderboard;

var graphics;

var nicknameField;

function load(){
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

  loader.add(files).on("progress", loadProgress).load(loadFiles)
}

function init(){
  canvas = document.getElementById("gamecanvas")
  renderer = PIXI.autoDetectRenderer(size[0], size[1], {view: canvas});
  renderer.backgroundColor = 0x1e1e1e

  menu = new Container();
  menu.scale.y = -1
  menu.position.y = size[1]
  menu.displayList = new PIXI.DisplayList()

  setupLobby()


  stage = new Container();
  stage.scale.y = -1
  stage.position.y = size[1]
  stage.displayList = new PIXI.DisplayList()

  setupGameUI()

  resize()
}

function setupGameUI(){
  roundIntermission = new Container()
  roundIntermission.visible = false
  stage.addChild(roundIntermission)

  graphics = new PIXI.Graphics()
  stage.addChild(graphics)

  tileMap = new Container()
  stage.addChild(tileMap)

  hud = new Container()
  stage.addChild(hud)

  leaderboard = new Container()
  stage.addChild(leaderboard)

  bulletGraphics = new PIXI.Graphics()
  stage.addChild(bulletGraphics)


  gunLeftBar = new Bar(size[0]*0.1, size[1]*0.025, {outerColor: 0x000080})
  gunLeftBar.hide()
  gunLeftBar.display.position.set(0, size[1]*0.075)
  hud.addChild(gunLeftBar.display)

  gunRightBar = new Bar(size[0]*0.1, size[1]*0.025)
  gunRightBar.hide()
  gunRightBar.display.position.set(0, size[1]*0.025)
  hud.addChild(gunRightBar.display)

  timerBar = new Bar(size[0], size[1]*0.01)
  timerBar.display.position.set(0, size[1])
  hud.addChild(timerBar.display)

  timerText = new PIXI.Text('', {fontSize: 60,fill: 0xffffff})
  timerText.x = size[0]/2
  timerText.y = size[1]
  timerText.anchor.x = 0.5
  timerText.anchor.y = -0.5
  timerText.scale.y = -0.5
  timerText.scale.x = 0.5
  hud.addChild(timerText)

  scoreText = new PIXI.Text('', {fill: 0xffffff})
  scoreText.x = size[0]
  scoreText.y = size[1]
  scoreText.anchor.x = 1
  scoreText.anchor.y = -1
  scoreText.scale.y = -1
  // hud.addChild(scoreText)

  var leaderboardTextWidth = size[0]*0.1

  var leaderboardTitleText = new PIXI.Text("leaderboard", {fill: 0xffffff, align: "left", fontSize:52})
  leaderboardTitleText.x = size[0]-leaderboardTextWidth/2
  leaderboardTitleText.y = size[1]
  leaderboardTitleText.anchor.x = 0.5
  leaderboardTitleText.anchor.y = -0.25
  leaderboardTitleText.scale.y = -0.5
  leaderboardTitleText.scale.x = 0.5
  leaderboard.addChild(leaderboardTitleText)

  // setup leaderboard
  for(var i = 1; i < gameData.gamedata["maxPerRoom"]+1; i++){
    var text = new PIXI.Text("", {fill: 0xffffff, align: "left", fontSize: 52})
    text.x = size[0]-leaderboardTextWidth
    text.y = size[1]-(text.height*i)
    text.anchor.x = 0
    text.anchor.y = -0.25
    text.scale.y = -0.5
    text.scale.x = 0.5
    leaderboardTexts.push(text)
    leaderboard.addChild(text)
  }

  newRoundBar = new Bar(size[0]/2, size[1]*0.01)
  newRoundBar.display.position.set(size[0]/4, size[1]*(3/4))
  // newRoundBar.dispaly.anchor.x = 0.5
  roundIntermission.addChild(newRoundBar.display)

  roundIntermissionLeaderboard = new Container()
  roundIntermission.addChild(roundIntermissionLeaderboard)


  var roundIntermissionLeaderboardTitleText = new PIXI.Text("Leaderboard", {fill: 0xffffff, align: "left", fontSize:52})
  roundIntermissionLeaderboardTitleText.x = size[0]/2
  roundIntermissionLeaderboardTitleText.y = (size[1])*(0.6)
  roundIntermissionLeaderboardTitleText.anchor.x = 0.5
  roundIntermissionLeaderboardTitleText.anchor.y = -0.5
  roundIntermissionLeaderboardTitleText.scale.y = -0.5
  roundIntermissionLeaderboardTitleText.scale.x = 0.5
  roundIntermissionLeaderboard.addChild(roundIntermissionLeaderboardTitleText)

  newRoundCountdown = new PIXI.Text("Starting in", {fill: 0xffffff, align: "center", fontSize: 50})
  newRoundCountdown.x = size[0]/2
  newRoundCountdown.y = size[1]/4
  newRoundCountdown.anchor.x = 0.5
  newRoundCountdown.anchor.y = 0
  newRoundCountdown.scale.y = -1
  roundIntermission.addChild(newRoundCountdown)

  for(var i = 0; i < gameData.gamedata["maxPerRoom"]; i++){
    if(i < 6){ //Max for leaderboard
      var text = new PIXI.Text("", {fill: 0xffffff, align: "center", fontSize: 52})
      text.x = size[0]/2
      text.y = (size[1]/2)-(text.height*i)
      text.anchor.x = 0.5
      text.anchor.y = -0.5
      text.scale.y = -0.5
      text.scale.x = 0.5
      roundIntermissionLeaderboardTexts.push(text)
      roundIntermissionLeaderboard.addChild(text)
    }
  }
}




function setupLobby(){

  function buttonDown(){
    this.texture = PIXI.Texture.fromImage("button_1.png")
    playText.position.y = 1
  }

  function playBtn(){
    this.texture = PIXI.Texture.fromImage("button_0.png")
    playText.position.y = 0
    socket.emit("jg", {nickname: nicknameField.text})
  }

  var playButton = new PIXI.Sprite(PIXI.Texture.fromImage("button_0.png"))
  playButton.anchor.x = playButton.anchor.y = 0.5
  playButton.position.x = size[0]/2
  playButton.position.y = size[1]/2
  playButton.scale.x = 20
  playButton.scale.y = -20
  playButton.interactive = true
  playButton.on('mousedown', buttonDown).on("mouseup", playBtn).on("mouseupoutside", function(){
    this.texture = PIXI.Texture.fromImage("button_0.png")
    playText.position.y = 0
  })

  // var playTextFontSize = 32
  var playText = new PIXI.Text("Play", {fill: 0xFFFFFF, fontSize: 52})
  playText.anchor.x = playText.anchor.y = 0.5
  playText.scale.x = 0.3
  playText.scale.y = 0.3
  // playText.x = -playButton.width/2/playButton.scale.x
  // playText.y = playButton.height/2/playButton.scale.y
  playButton.addChild(playText)

  var titleText = new PIXI.Text("deathmatch.online", {fill: 0xFFFFFF, fontSize: 100})
  titleText.anchor.x = 0.5
  titleText.anchor.y = -0.5
  titleText.position.x = size[0]/2
  titleText.position.y = size[1]
  titleText.scale.x = 1
  titleText.scale.y = -1

  nicknameField = new PixiTextInput("", {fontSize: 44})
  nicknameField.width = size[0]*0.2
  nicknameField.x = size[0]/2-nicknameField.localWidth/2
  nicknameField.y = size[1]*0.3
  // nicknameField.anchor.x = 0.5//nicknameField.anchor.y = 0.5
  nicknameField.scale.y = -1
  menu.addChild(nicknameField)


  var versionText = new PIXI.Text(gameData.metadata["version"], {fill: 0xFFFFFF, fontSize: 20})
  versionText.anchor.x = 0
  versionText.anchor.y = 1
  versionText.position.x = 0
  versionText.position.y = 0
  versionText.scale.x = 1
  versionText.scale.y = -1

  menu.addChild(versionText)
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
      socket.emit("i", [bToI(left), bToI(right), bToI(jump), bToI(shootLeft), bToI(shootRight), rd(localPlayer.direction[0]), rd(localPlayer.direction[1])])
    }

    updatePhysics(delta)

    renderer.render(stage)
  }else if(curretScene == 0){
    renderer.render(menu)
  }
  // setTimeout(gameLoop, 1/60)
  time = Date.now()
}

function bloop(){
  stepBullets()
  setTimeout(bloop, 1/60)
}

//bool to int
function bToI(b){
  if(b == true){
    return 0
  }else{
    return 1
  }
}

// round num
function rd(num){
  return parseFloat(num.toFixed(2))
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
