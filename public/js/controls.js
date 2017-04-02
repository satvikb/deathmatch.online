var keys = {"jump":[32, 38, 87], "left":[37, 65], "right":[39, 68], "shootleft":[16 /* shift*/, 18/*alt for arrows*/], "shootright":[83 /* s */, 40/* down arrow */]}
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

  if(localPlayer){
    if(inArray(code, keys["jump"])){
      jump = true
    }

    if(inArray(code, keys["left"])){
      left = true
      localPlayer.startMove(true)
    }

    if(inArray(code, keys["right"])){
      right = true
      localPlayer.startMove(false)
    }

    if(inArray(code, keys["shootleft"])){
      shootLeft = true
    }

    if(inArray(code, keys["shootright"])){
      shootRight = true
    }
  }
}

function keyup(event){
  var code = event.keyCode

  if(localPlayer){
    if(inArray(code, keys["jump"])){
      jump = false
    }

    if(inArray(code, keys["left"])){
      left = false
      localPlayer.liftMove(true)
    }

    if(inArray(code, keys["right"])){
      right = false
      localPlayer.liftMove(false)
    }

    if(inArray(code, keys["shootleft"])){
      shootLeft = false
    }

    if(inArray(code, keys["shootright"])){
      shootRight = false
    }
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

function context(e){
  e.preventDefault()
  return false
}

window.addEventListener("keydown", keydown, false)
window.addEventListener("keyup", keyup, false)
window.addEventListener("mousemove", mousemove, false)

window.addEventListener("mousedown", mousedown, false)
window.addEventListener("mouseup", mouseup, false)
window.addEventListener("contextmenu", context, false)
