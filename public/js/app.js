var b = new Bump(PIXI);
var renderer;
var stage;

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

  loader.add(files).on("progress", loadProgress).load(loadFiles)
  initConnection()
}

function gameLoop(){
  requestAnimationFrame(gameLoop);

  localPlayer.update()

  renderer.render(stage)
}


init()
