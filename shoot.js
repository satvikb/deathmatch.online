var constants = require('./constants.js')
var p2 = constants.p2
var utils = require("./util.js").utils
var fs = require('fs')

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

  this.color = '0xffffff'//+Math.floor(Math.random()*16777215).toString(16)
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
      this.remove = true

      if(result.body.isPlayer == true){
        var shootingPlayer = this.player
        var hitPlayer = result.body.player

        hitPlayer.subtractHealth(this.gun.bulletDamage, {type: "player"}, function(){
          //kill handler
          shootingPlayer.addScore(100, {type: "kill"})
          this.remove = true
          return;
        })
        shootingPlayer.addScore(this.gun.bulletDamage, {type: "hit"})
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
  TODO damageCurve - math function to determine how much damage each bullet does, based on bulletDamage (e.g. take into account distance). default: y = bulletDamage
  reloadSpeed - time to reload each bullet (ms)
  thickness - how thick each bullet is (px?) TODO Raycast multiple to achieve real thickness.
*/
function Gun(id, name, laserLength, shootSpeed, travelSpeed, maxAmmo, bulletDamage, reloadSpeed, thickness, reloadCooldown){
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
  this.reloadCooldown = reloadCooldown || 1000//Wait this long after shooting to start reloading

  this.shootFrame = false

  this.shoot = function(player, start, direction){
    if(Date.now()-this.shootTime > this.shootSpeed){
      if(this.ammo.currentAmmo > 0){
        this.shootHandler.addBullet(player, start, direction)
        this.ammo.currentAmmo -= 1
        this.shootTime = Date.now()
        this.shootFrame = true
      }
    }
  }

  this.step = function(){
    this.shootHandler.step()

    if(Date.now()-this.shootTime > this.reloadCooldown){
      if(Date.now()-this.reloadTime > this.ammo.reloadSpeed){
        if(this.ammo.currentAmmo < this.ammo.maxAmmo){
          this.ammo.currentAmmo += 1
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
  if(Guns.madeGuns == undefined){
    Guns.madeGuns = true

    Guns.none = null

    var gunsData = JSON.parse(fs.readFileSync('public/data/guns.json', 'utf8'))["guns"]
    for(var i = 0; i < gunsData.length; i++){
      var d = gunsData[i]
      Guns[d.name] = new Gun(d.id, d.name, d.laserLength, d.shootSpeed, d.travelSpeed, d.maxAmmo, d.bulletDamage, d.reloadSpeed, d.thickness, d.reloadCooldown)
    }
  }
}

var CloneGun = function(gun){
  return new Gun(gun.id, gun.name, gun.laserLength, gun.shootSpeed, gun.travelSpeed, gun.ammo.maxAmmo, gun.bulletDamage, gun.ammo.reloadSpeed, gun.thickness, gun.reloadCooldown)
}

exports.ShootHandler = ShootHandler
exports.BulletData = BulletData
exports.Gun = Gun
exports.Guns = Guns
exports.CloneGun = CloneGun
