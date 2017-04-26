var Guns = {}

function initGuns(){
  Guns.none = null

  var data = gunJson["guns"]
  for(var i = 0; i < data.length; i++){
    var d = data[i]
    Guns[d.name] = new Gun(d.id, d.name, d.laserLength, d.shootSpeed, d.travelSpeed, d.maxAmmo, d.bulletDamage, d.reloadSpeed, d.thickness, d.reloadCooldown)
  }
}

function Gun(id, name, laserLength, shootSpeed, travelSpeed, maxAmmo, bulletDamage, reloadSpeed, thickness, reloadCooldown){
  this.id = id
  this.name = name

  this.ammo = {
    maxAmmo: maxAmmo,
    reloadSpeed: reloadSpeed
  }

  this.laserLength = laserLength
  this.shootSpeed = shootSpeed
  this.travelSpeed = travelSpeed
  this.bulletDamage = bulletDamage
  this.thickness = thickness
  this.reloadCooldown = reloadCooldown || 1000
}

var CloneGun = function(gun){
  if(gun){
    return new Gun(gun.id, gun.name, gun.laserLength, gun.shootSpeed, gun.travelSpeed, gun.ammo.maxAmmo, gun.bulletDamage, gun.ammo.reloadSpeed, gun.thickness, gun.reloadCooldown)
  }else{
    return Guns.none
  }
}

function GetGunFromId(id){
  for(var gunName in Guns){
    var gun = Guns[gunName]
    if(gun){
      if(gun.id == id){
        return gun
      }
    }
  }
  return Guns.none
}
