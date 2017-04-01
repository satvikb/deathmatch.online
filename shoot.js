var constants = require('./constants.js')
var p2 = constants.p2
var utils = require("./util.js").utils

var ShootHandler = function(gun){
  this.gun = gun
  this.bulletData = []

  this.getBulletRayData = function(){
    var data = []

    for(var b = 0; b < this.bulletData.length; b++){
      var bullet = this.bulletData[b]
      var from = bullet.displayFrom//ray.from
      var to = bullet.displayTo//ray.to

      var col = bullet.color
      var thickness = bullet.thickness

      data.push([from[0], from[1], to[0], to[1], thickness, col])
    }
    return data
  }

  this.addBullet = function(player, startPos, direction){
    var laserLength = p2.vec2.create();
    p2.vec2.scale(laserLength, direction, this.gun.laserLength)
    var travelSpeedDistance = p2.vec2.create()
    p2.vec2.scale(travelSpeedDistance, direction, this.gun.travelSpeed)


    var endDisplayPos = p2.vec2.create()
    p2.vec2.add(endDisplayPos, startPos, laserLength)

    var endRayPos = p2.vec2.create();
    p2.vec2.copy(endRayPos, endDisplayPos)
    p2.vec2.add(endRayPos, endDisplayPos, travelSpeedDistance)

    var bullet = new BulletData(player, this.gun, startPos, endRayPos, endDisplayPos, direction, this.gun.thickness)
    this.bulletData.push(bullet)
  }

  this.step = function(){
    var bulletsToRemove = []

    for(var b = 0; b < this.bulletData.length; b++){
      var bullet = this.bulletData[b]
      bullet.step()

      var bPosF = bullet.ray.from
      var bX = bPosF[0]
      var bY = bPosF[1]

      var boundSize = [utils.size[0]*0.05, utils.size[1]*0.05]

      if(bX > (utils.size[0]+boundSize[0]) || bX < (-boundSize[0]) || bY > (utils.size[1]+boundSize[1]) || bY < (-boundSize[1])){
        // console.log("OOB "+bX+" "+bY)
        //Out of bouunds
        bulletsToRemove.push(bullet)
      }

      if(bullet.remove == true){
        bulletsToRemove.push(bullet)
      }
    }

    for(var b = 0; b < bulletsToRemove.length; b++){
      var bul = bulletsToRemove[b]
      this.bulletData.splice(this.bulletData.indexOf(bul), 1);
      // console.log("removing bullet")
    }
    bulletsToRemove = []
  }
}

var BulletData = function(player, gun, from, toRay, toDisplay, direction, thickness){
  this.gun = gun
  this.player = player

  this.ray = new p2.Ray({
    mode: p2.Ray.ANY
  })

  this.displayFrom = from
  this.displayTo = toDisplay

  this.ray.from = from
  this.ray.to = toRay

  this.direction = direction

  this.color = '0x'+Math.floor(Math.random()*16777215).toString(16)
  this.thickness = thickness

  // What point (from or to) should change in the ray the next step
  // This is to prevent the ray from skipping on invisible objects
  // this.prevStepChange = 0

  this.remove = false

  this.step = function(){
    var newFrom = p2.vec2.create()
    var newToRay = p2.vec2.create()
    var newToDisplay = p2.vec2.create()

    var laserDistance = p2.vec2.create()
    var travelSpeedDistance = p2.vec2.create()

    p2.vec2.copy(newFrom, this.ray.to)

    p2.vec2.scale(laserDistance, this.direction, this.gun.laserLength)
    p2.vec2.scale(travelSpeedDistance, this.direction, this.gun.travelSpeed)

    this.ray.from = newFrom
    this.displayFrom = newFrom

    p2.vec2.add(newToDisplay, newFrom, laserDistance)
    this.displayTo = newToDisplay

    p2.vec2.add(newToRay, newToDisplay, travelSpeedDistance)
    this.ray.to = newToRay

    this.ray.update()

    // Handle collisions
    var result = new p2.RaycastResult()
    this.player.room.world.raycast(result, this.ray)

    var hitPoint = p2.vec2.create()
    result.getHitPoint(hitPoint, this.ray)
    if(result.body && result.body != this.player.body){
      // console.log("Bullet hit "+hitPoint[0]+" "+hitPoint[1]+" "+result.getHitDistance(this.ray)+" "+result.body)
      this.remove = true

      if(result.body.isPlayer == true){
        var shootingPlayer = this.player
        var hitPlayer = result.body.player

        hitPlayer.subtractHealth(this.gun.bulletDamage, {type: "player"}, function(){
          //kill handler
          shootingPlayer.addScore(100, {type: "kill"})
        })
        shootingPlayer.addScore(this.gun.bulletDamage, {type: "hit"})
        console.log("Player!" +result.body.player.movespeed)
      }
    }
  }
}

/*
  id - gun id
  name - gun name
  laserLength - length of each bullet (px?)
  shootSpeed - minimum time inbetween shots (ms)
  travelSpeed - distance each bullet travels every step (px?)
  maxAmmo - maximum ammo gun can have. init's currentAmmo to this. (int)
  bulletDamage - damage each bullet does (int) TODO Should be max damage when implelemting damageCurve
  TODO damageCurve - math function to determine how much damage each bullet does based on bulletDamage. default: y = bulletDamage
  reloadSpeed - time to reload each bullet (ms)
  thickness - how thick each bullet is (px?) TODO Raycast multiple to achieve real thickness.
*/
var Gun = function(id, name, laserLength, shootSpeed, travelSpeed, maxAmmo, bulletDamage, reloadSpeed, thickness){
  this.id = id
  this.name = name

  this.ammo = {
    currentAmmo: maxAmmo,
    maxAmmo: maxAmmo,
    bulletPerReload: 1, //Multiple bullets can be reloaded at one time
    reloadSpeed: reloadSpeed
  }

  this.laserLength = laserLength
  this.shootSpeed = shootSpeed
  this.travelSpeed = travelSpeed
  this.bulletDamage = bulletDamage
  this.thickness = thickness


  this.shootHandler = new ShootHandler(this)

  this.shootTime = Date.now()

  this.reloadTime = Date.now()

  this.reloadCooldown = 1000 //Wait this long after shooting to start reloading

  this.shoot = function(player, start, direction){
    if(Date.now()-this.shootTime > this.shootSpeed){
      if(this.ammo.currentAmmo > 0){
        this.shootHandler.addBullet(player, start, direction)
        this.ammo.currentAmmo -= 1
        this.shootTime = Date.now()
      }
    }
  }

  this.step = function(){
    this.shootHandler.step()
    // console.log("step")
    if(Date.now()-this.shootTime > this.reloadCooldown){
      if(Date.now()-this.reloadTime > this.ammo.reloadSpeed){
        if(this.ammo.currentAmmo < this.ammo.maxAmmo){
          this.ammo.currentAmmo += 1
          // this.ammo.currentAmmo = this.ammo.maxAmmo
          this.reloadTime = Date.now()
        }
      }
    }
  }

  this.reset = function(){
    this.shootHandler.bulletData = []
    this.ammo.currentAmmo = this.ammo.maxAmmo
    this.shootTime = this.reloadTime = Date.now()
  }
}

var Guns = function(){
  console.log("g")
  if(Guns.madeGuns == undefined){
    console.log("GUNS")
    Guns.madeGuns = true

    // function Gun(id, name, laserLength, shootSpeed, travelSpeed, maxAmmo, bulletDamage, reloadSpeed, thickness){
    // this.gunLeft = new Gun(0, "name", 5, 50, 1, 100, 1, 200, 3) //TODO Gun handler class with constants

    Guns.none = null
    Guns.pistol = new Gun(    0,     "Pistol",      5,  150, 0.8, 16,  0.5, 500,  2)
    Guns.machineGun = new Gun(1,     "Machine gun", 5,  50,  1,   100, 1,   200,  3)
    Guns.shotgun = new Gun(   2,     "Shotgun",     15, 500, 3,   12,  8,   2000, 6)
  }
}

exports.ShootHandler = ShootHandler
exports.BulletData = BulletData
exports.Gun = Gun
exports.Guns = Guns
