var b = new Bump(PIXI);
var renderer;
var stage;
var basicText;

function init(){
  PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

  renderer = autoDetectRenderer(256, 256, {antialias: false, transparent: false, resolution: 1});
  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  // renderer.renderSession.roundPixels = true
  renderer.resize(window.innerWidth, window.innerHeight);

  // Add the canvas to the HTML document
  document.body.appendChild(renderer.view);

  // Create a container object called the `stage`
  stage = new Container();

  //Tell the `renderer` to `render` the `stage`
  renderer.render(stage);

  basicText = new PIXI.Text('Basic text in pixi', {fill:0xffffff});
  basicText.text = "Test"
  basicText.x = 100;
  basicText.y = 300;
  stage.addChild(basicText)

  loader.add(files).on("progress", loadProgress).load(loadFiles)
}

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
