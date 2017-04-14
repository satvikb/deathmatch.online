var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;
var TextureCache = PIXI.utils.TextureCache;
var Texture = PIXI.Texture;
var Sprite = PIXI.Sprite;
var JsonLoader = PIXI.JsonLoader;
var loader = PIXI.loader;
var resources = PIXI.loader.resources;

var size = [1920, 1080];
var mapSize = [32, 18]

var spritesheet = "textures/data.json"

var files = [spritesheet]

var id;
var gunJson;

function loadProgress(loader, resource){

}

function loadFiles(){
  id = PIXI.loader.resources["textures/data.json"].textures;
  var resourceLoader = new loader.Loader()

  resourceLoader.add("guns", "data/guns.json");
  resourceLoader.load(function(loader, resources){
    gunJson = resources.guns
    console.log('loaded guns '+gunJson)

    init()
    initConnection()

    gameLoop()
  })
}
