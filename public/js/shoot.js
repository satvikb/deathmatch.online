var bulletData = []

function addBullet(player, gun){

  if(player){
    console.log("added bullet")
    var startPos = player.body.position
    var direction = player.direction

    var laserLength = p2.vec2.create();
    p2.vec2.scale(laserLength, direction, gun.laserLength)
    var travelSpeedDistance = p2.vec2.create()
    p2.vec2.scale(travelSpeedDistance, direction, gun.travelSpeed)


    var endDisplayPos = p2.vec2.create()
    p2.vec2.add(endDisplayPos, startPos, laserLength)

    var endRayPos = p2.vec2.create();
    p2.vec2.copy(endRayPos, endDisplayPos)
    p2.vec2.add(endRayPos, endDisplayPos, travelSpeedDistance)

    var bullet = new BulletData(player, gun, startPos, endRayPos, endDisplayPos, direction, gun.thickness)
    bulletData.push(bullet)
  }
}

function stepBullets(){
  var bulletsToRemove = []

  for(var b = 0; b < bulletData.length; b++){
    var bullet = bulletData[b]
    bullet.step()

    var bPosF = bullet.ray.from
    var bX = bPosF[0]
    var bY = bPosF[1]

    var boundSize = [size[0]*0.05, size[1]*0.05]

    if(bX > (size[0]+boundSize[0]) || bX < (-boundSize[0]) || bY > (size[1]+boundSize[1]) || bY < (-boundSize[1])){
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
    bulletData.splice(bulletData.indexOf(bul), 1);
    // console.log("removing bullet")
  }
  bulletsToRemove = []
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
    world.raycast(result, this.ray)

    var hitPoint = p2.vec2.create()
    result.getHitPoint(hitPoint, this.ray)
    if(result.body && result.body != this.player.body){
      this.remove = true
    }
  }
}
