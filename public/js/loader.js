var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;
var TextureCache = PIXI.utils.TextureCache;
var Texture = PIXI.Texture;
var Sprite = PIXI.Sprite;
var loader = PIXI.loader;
var resources = PIXI.loader.resources;

var size = [1920, 1080];

var spritesheet = "textures/data.json"

var files = [spritesheet]

var id;

function loadProgress(loader, resource){
  console.log("loading "+loader.progress+"%")
}

function loadFiles(){
  id = PIXI.loader.resources["textures/data.json"].textures;
  initConnection()

  gameLoop()
  inputLoop()
}
