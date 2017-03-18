var keys = {"jump":[32, 38, 87], "left":[37, 65], "right":[39, 68], "shootleft":[16, 18/*alt*/], "shootright":[83, 40]}
var jump = false
var left = false
var right = false
var shootLeft = false
var shootRight = false

function inArray(value, array){
  return array.indexOf(value) !== -1;
}

function keyDown(event){
  var code = event.keyCode

  if(inArray(code, keys["jump"])){
    console.log("Jump!")
    jump = true
  }

  if(inArray(code, keys["left"])){
    console.log("Left!")
    left = true
  }

  if(inArray(code, keys["right"])){
    console.log("Right!")
    right = true
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

function keyUp(event){
  var code = event.keyCode

  if(inArray(code, keys["jump"])){
    console.log("Jump!")
    jump = false
  }

  if(inArray(code, keys["left"])){
    console.log("Left!")
    left = false
  }

  if(inArray(code, keys["right"])){
    console.log("Right!")
    right = false
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

window.addEventListener("keydown", keyDown, false)
window.addEventListener("keyup", keyUp, false)

// function key(code){
//   var k = {}
//   k.code = code
//   k.isDown = false
//   k.isUp = false
//   k.press = undefined
//   k.release = undefined
//
//   k.downHandler = function(e){
//     if(e.keyCode == k.code){
//       if(k.isUp && k.press) key.press();
//       k.isDown = true;
//       k.isUp = false;
//     }
//     e.preventDefault()
//   }
//
//   k.upHandler = function(e){
//     if(e.keyCode == k.code){
//       if(k.isDown && k.release) key.release();
//       k.isDown = false;
//       k.isUp = true;
//     }
//     e.preventDefault()
//   }
//
//   window.addEventListener("keydown", k.downHandler.bind(k), false);
//   window.addEventListener("keyup", k.upHandler.bind(k), false);
//   return k;
// }
