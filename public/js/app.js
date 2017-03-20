var renderer;
var mainStage;
var basicText;

function init(){
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

  var canvas = document.getElementById("gamecanvas")
  console.log(canvas)
  renderer = PIXI.autoDetectRenderer(1080, 720)//, {view: canvas});
  // renderer.view.style.position = "absolute";
  // renderer.view.style.display = "block";
  // renderer.autoResize = true;
  // renderer.renderSession.roundPixels = true
  renderer.resize(1080, 720);

  // Add the canvas to the HTML document
  document.body.appendChild(renderer.view);







  // Create a container object called the `stage`
  mainStage = new Container();
  stage = new PIXI.DisplayObjectContainer()
  console.log(stage.width+" "+stage.scale.x)
  mainStage.addChild(stage)

  basicText = new PIXI.Text('Basic text in pixi', {fill:0xffffff});
  basicText.text = "Test"
  basicText.x = 100;
  basicText.y = 300;
  stage.addChild(basicText)


  loader.add(files).on("progress", loadProgress).load(loadFiles)

  resize()
}

var appWidth = 1080
var appHeight = 720

function resize() {
  // var isPortrait = window.innerHeight > window.innerWidth;
  // var gameWidth, gameHeight, gameScale;
  // if (isPortrait) {
  //   // Portrait scaling
  //   var aspect = appHeight/appWidth
  //   var curAspect = window.innerHeight/window.innerWidth
  //
  //
  //   gameWidth = appWidth;
  //   gameHeight = window.innerHeight * (appWidth / window.innerWidth);
  //   gameScale = window.innerWidth / appWidth;
  // } else {
  //   var aspect = appWidth/appHeight
  //   var curAspect = window.innerWidth/window.innerHeight
  //   var mul = aspect/curAspect
  //   var newWidth = appWidth*mul
  //
  //   // Landscape scaling
  //   gameWidth = window.innerWidth * (appHeight / window.innerHeight);
  //   gameHeight = appHeight;
  //   gameScale = window.innerHeight / appHeight;
  // }
  // console.log(newWidth+" "+window.innerWidth+" "+window.innerWidth/newWidth)
  // stage.scale.set(window.innerWidth/newWidth, 1)//(gameScale, gameScale);


  var aspect = 16/9;
  var w = window.innerWidth;
  var h = window.innerHeight;
  var nw = w, nh = h;
  if(w > h * aspect)
  {
  	//Height is the limiting factor
  	nw = h*aspect;
    console.log("sesad"+h+" "+nh)
    // stage.scale.set(nw/w, nw/w)
  }
  else
  {
  	//Width is the limiting factor
  	nh = w*1/aspect;
    console.log("Decrease by: "+nh/h)
    // console.log("se"+h+" "+nh+" "+w+" "+nw)

    stage.scale.set(nh/h, nh/h) //TODO EX. Closing Inpect tab does not change scale
  }
  console.log(h+" "+nh+"______"+stage.width+" "+stage.height)
  renderer.resize(nw, nh);
  // stage.scale.set(1, 1)
  // stage.height = nh
  // stage.width = nw
}



window.addEventListener("resize", resize, false)

var time = Date.now()

function gameLoop(){
  var d = (Date.now()-time)/1000

  requestAnimationFrame(gameLoop);

  if(localPlayer){
    localPlayer.update(d)
    socket.emit("input", {left:left, right: right})
  }

  updatePhysics(d)

  renderer.render(stage)
  time = Date.now()
}


init()
