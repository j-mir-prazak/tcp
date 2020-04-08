// Include Nodejs' net module.


const Net = require('net');

const fs = require('fs');




// The port on which the server is listening.


const port = 8080;


var spawn = require('child_process');
var result;

if ( ! result) {
  console.log("creating")
  result = spawn.spawn("ffplay", ["-"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
  });
}
console.log(result)


// Use net.createServer() in your code. This is just for illustration purpose.
// Create a new TCP server.
const server = new Net.Server();
// The server listens to a socket for a client to make a connection request.
// Think of a socket as an end point.


server.listen(port, function() {
    console.log(`Server listening for connection requests on socket localhost:${port}`);
});

// When a client requests a connection with the server, the server creates a new
// socket dedicated to that client.



server.on('connection', function(socket) {


    console.log('A new connection has been established.');

    // Now that a TCP connection has been established, the server can send data to
    // the client by writing to its socket.



    socket.write('Hello, client.');

    // The server can also receive data from the client by reading from its socket.



    socket.on('data', function(chunk) {
        // console.log(`Data received from client: ${chunk.toString()}`);
        // console.log("data")

        chunks.push(chunk)
        setTimeout(function (){ handlePlayback() },1000)
        // console.log(chunks)



    });

    // When the client requests to end the TCP connection with the server, the server
    // ends the connection.



    socket.on('end', function() {
        console.log('Closing connection with the client');
    });

    // Don't forget to catch error, for your own sake.



    socket.on('error', function(err) {
        console.log(`Error: ${err}`);
        // console.log(chunks)
    });
});


var chunks = [];
var choke = false;
var playback = 0;

function handlePlayback( hand ) {
  var hand = hand || false
  if ( playback == 1 && hand == false ) return;

  playback = 1;

  if ( choke == false ) {

    console.log("no choke")

    var next = chunks.shift()
    console.log(next)
    if ( result.stdin.write( next ) == false ) {
      // chunks.unshift(next)
      console.log("choke")
      choke = true;

      result.stdin.once('drain', function () {
        console.log("unchoke")
        choke = false;
        handlePlayback(true)
      });


    };
  }
}
