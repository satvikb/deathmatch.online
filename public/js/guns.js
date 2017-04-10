var Guns = {}

Guns.none = null
Guns.pistol = new Gun(     0,     "Pistol",      5,  150, 0.8, 16,  0.5, 500,  2)
Guns.machineGun = new Gun( 1,     "Machine gun", 5,  50,  1,   100, 1,   200,  3)
Guns.shotgun = new Gun(    2,     "Shotgun",     15, 500, 3,   12,  8,   2000, 6)

function Gun(id, name, laserLength, shootSpeed, travelSpeed, maxAmmo, bulletDamage, reloadSpeed, thickness){
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
}

function GetGunFromId(id){
  for(var gunName in Guns){
    // console.log("g "+gunName+" "+Guns)
    var gun = Guns[gunName]
    if(gun){
      if(gun.id == id){
        return gun
      }
    }
  }
}