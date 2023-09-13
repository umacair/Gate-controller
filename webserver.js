var http = require('http').createServer(handler); //require http server, and create server with function handler()
var fs = require('fs'); //require filesystem module
var io = require('socket.io')(http) //require socket.io module and pass the http object (server)
var Gpio = require('onoff').Gpio; //include onoff to interact with the GPIO

var WINCH1UP = new Gpio(23,'out');
var WINCH1DW = new Gpio(24,'out');
var on = 0;
var off = 1;
var first = 0;

//var pushButton = new Gpio(17, 'in', 'both'); //use GPIO pin 17 as input, and 'both' button presses, and releases should be handled

http.listen(8080); //listen to port 8080

function handler (req, res) { //create server
  fs.readFile(__dirname + '/public/index.html', function(err, data) { //read file index.html in public folder
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'}); //display 404 on error
      return res.end("404 Not Found");
    }
    res.writeHead(200, {'Content-Type': 'text/html'}); //write HTML
    res.write(data); //write data from index.html
    return res.end();
  });
}
io.sockets.on('connection', function (socket) {// WebSocket Connection
  var winch1upvalue = 0;
  var winch1dwvalue = 0;
  var winch1stvalue = 0;

  if(WINCH1UP.readSync())
  {
    first = 0;
    socket.emit('winch1Up',on);
  }else{
    first = 0;
    socket.emit('winch1Up',off);
  }

  if(WINCH1DW.readSync())
  {
    first = 0;
    socket.emit('winch1Dw',on);
  }else{
    first = 0;
    socket.emit('winch1Dw',off);
  }

  socket.on('winch1Up', function(data) { //get light switch status from client
    if(first){
      if(WINCH1UP.readSync()){
        if(data){
          WINCH1DW.writeSync(off);
          socket.emit('winch1Dw',0);
          socket.emit('winch1St',0);
          wait(0.5);
          WINCH1UP.writeSync(on); //turn LED on or of
  
        }else{
        }
  
      }else{
        if(data){
  
        }else{
          WINCH1UP.writeSync(off); //turn LED on or of
  
        }
  
      }
    }else{
      first = 1;

    }
  });

  socket.on('winch1Dw', function(data) { //get light switch status from client
    if(first){
      if(WINCH1UP.readSync()){
        if(data){
          WINCH1UP.writeSync(off);
          socket.emit('winch1Up',0);
          socket.emit('winch1St',0);
          wait(0.5);
          WINCH1DW.writeSync(on); //turn LED on or of
  
        }else{
        }
  
      }else{
        if(data){
  
        }else{
          WINCH1DW.writeSync(off); //turn LED on or of
  
        }
  
      }
    }else{
      first = 1;

    }
  });



});
// gpio 핀 초기화
process.on('SIGINT', function () { //on ctrl+c
  WINCH1UP.writeSync(off); // Turn LED off
  WINCH1UP.unexport(); // Unexport LED GPIO to free resources
  WINCH1DW.writeSync(off); // Turn LED off
  WINCH1DW.unexport(); // Unexport LED GPIO to free resources
  process.exit(); //exit completely
});

function wait(sec) {
  let start = Date.now(), now = start;
  while (now - start < sec * 1000) {
      now = Date.now();
  }
}
