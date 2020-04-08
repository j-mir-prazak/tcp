
var fs = require('fs');
var spawn = require('child_process');
var net = net = require('net');


var result;
var result2;


sock = new net.Socket('node.sock');
console.log(sock);

if ( ! result) {
  console.log("creating")
  result = spawn.spawn("cat",
   ["../pf-video.webm"],
   {
     stdio:'pipe'
   }

);

}

if ( ! result2) {
  console.log("creating")
  result2 = spawn.spawn("ffplay",["-"],
   {
     stdio:'pipe',
     detached:true
   }

);

}

var fs = require("fs");

var myFile = fs.createWriteStream("stream");

result.stdout.pipe(result2.stdin);

net.createServer(function(socket) {
  socket.write('data');
});


// Create socket file
// fs.open('node.sock', 'w+', function(err, fdesc){
//     if (err || !fdesc) {
//         throw 'Error: ' + (err || 'No fdesc');
//     }

    // Create socket
// });
