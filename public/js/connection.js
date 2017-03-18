var socket;

function initConnection(){
  socket = io.connect("http://localhost:8000")
  socketEventHandlers
}

function socketEventHandlers(){
  socket.on("connect", socketconnect)
  socket.on("update", update)
}

//Client connected to page, not game
function socketconnect(data){
  console.log("connect")
}

function update(data){

}
