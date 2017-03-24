var keys = {"jump":[32, 38, 87], "left":[37, 65], "right":[39, 68], "shootleft":[16, 18/*alt*/], "shootright":[83, 40]}
var jump = false
var left = false
var right = false
var shootLeft = false
var shootRight = false

function inArray(value, array){
  return array.indexOf(value) !== -1;
}

function keydown(event){
  var code = event.keyCode

  if(inArray(code, keys["jump"])){
    console.log("Jump!")
    jump = true
  }

  if(inArray(code, keys["left"])){
    console.log("Left!")
    left = true
    localPlayer.startMove(true)

  }

  if(inArray(code, keys["right"])){
    console.log("Right!")
    right = true
    localPlayer.startMove(false)
  }

  if(inArray(code, keys["shootleft"])){
    console.log("Shoot Left Hand!")
    shootLeft = true
  }

  if(inArray(code, keys["shootright"])){
    console.log("Shoot Right Hand!")
    shootRight = true
  }
}

function keyup(event){
  var code = event.keyCode

  if(inArray(code, keys["jump"])){
    console.log("Jump!")
    jump = false
  }

  if(inArray(code, keys["left"])){
    console.log("Left!")
    left = false
    localPlayer.liftMove(true)
  }

  if(inArray(code, keys["right"])){
    console.log("Right!")
    right = false
    localPlayer.liftMove(false)
  }

  if(inArray(code, keys["shootleft"])){
    console.log("Shoot Left Hand!")
    shootLeft = false
  }

  if(inArray(code, keys["shootright"])){
    console.log("Shoot Right Hand!")
    shootRight = false
  }
}

function mousemove(event){
  if(localPlayer){
    localPlayer.mouseMove(event.clientX, event.clientY)
  }
}

function mousedown(event){
  if(event.button == 0){
    shootLeft = true
  }

  if(event.button == 2){
    shootRight = true
  }

  event.preventDefault()
}

function mouseup(event){
  if(event.button == 0){
    shootLeft = false
  }

  if(event.button == 2){
    shootRight = false
  }
  event.preventDefault()
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)
window.addEventListener("mousemove", mousemove, false)

window.addEventListener("mousedown", mousedown, false)
window.addEventListener("mouseup", mouseup, false)
