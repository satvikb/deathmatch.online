var Container = PIXI.Container;
var autoDetectRenderer = PIXI.autoDetectRenderer;
var TextureCache = PIXI.utils.TextureCache;
var Texture = PIXI.Texture;
var Sprite = PIXI.Sprite;
var loader = PIXI.loader;
var resources = PIXI.loader.resources;

var size = [1920, 1080];
var mapSize = [32, 18]

var spritesheet = "textures/data.json"

var files = [spritesheet]

var id;
var gunJson;
var gameDataJson;

var gameData = {}

function loadProgress(loader, resource){

}

function loadFiles(){
  id = PIXI.loader.resources["textures/data.json"].textures;

  PIXI.loader.add("guns", "data/guns.json");
  PIXI.loader.add("gamedata", "data/game.json");

  PIXI.loader.load(function(loader, resources){
    gunJson = resources.guns["data"]
    gameDataJson = resources.gamedata["data"]["data"]
    console.log("game data "+JSON.stringify(gameDataJson))
    gameData.metadata = gameDataJson["metadata"]
    gameData.gamedata = gameDataJson["gamedata"]

    initGuns()
    init()
    initConnection()

    gameLoop()
    bloop()
  })
}
