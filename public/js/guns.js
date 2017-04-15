var Guns = {}

function initGuns(){
  Guns.none = null

  var data = gunJson["guns"]
  for(var i = 0; i < data.length; i++){
    var d = data[i]
    Guns[d.name] = new Gun(d.id, d.name, d.laserLength, d.shootSpeed, d.travelSpeed, d.maxAmmo, d.bulletDamage, d.reloadSpeed, d.thickness)
    // console.log("loaded gun "+JSON.stringify(d)+"...."+d.name+" "+Guns[d.name]+" "+Guns[d.name].name)
  }
}

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

var CloneGun = function(gun){
  console.log("cloning gun "+gun.id+" "+gun.name)
  if(gun){
    return new Gun(gun.id, gun.name, gun.laserLength, gun.shootSpeed, gun.travelSpeed, gun.ammo.maxAmmo, gun.bulletDamage, gun.ammo.reloadSpeed, gun.thickness)
  }else{
    return Guns.none
  }
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
  return Guns.none
}
