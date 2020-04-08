const https = require('https');
const fs = require('fs');
var net = require('net');
var child_process = require('child_process');
var string_decoder = require('string_decoder');
var tls = require('tls')

var sockets = {}
var port = 9999


var ffplays = [];

var ffplay_pipes = {}

const server_options = {

  key: fs.readFileSync('./cert/nodejs.pem'),
  cert: fs.readFileSync('./cert/nodejs.crt'),
  // passphrase: 'black_BOX'

  }

var http_server = https.createServer(server_options, function (req, res) {
  console.log("NEW REQUEST")
  console.log("ADDRESS: " + req.socket.remoteAddress)
  console.log("PORT: " + req.socket.remotePort)

  var url = req.url.split("?")
  var query = req.url.split("?")[1] || ""
  url = req.url.split("?")[0]

  console.log("URL: " + url)
  console.log("QUERY: " + query)

  // for (var k in req ) console.log(k)
  if ( url == "/stream") {

    sockets[port] = {}
    sockets[port]["socket"] = setupInputSocket(port)
    sockets[port]["socket_type"] = "input"
    sockets[port]["socket_state"] = "init"
    sockets[port]["init"] = ""


    console.log("response")
    res.write(String(port))
    res.end()
    port++

  }


  if ( url == "/play") {

    sockets[port] = {}
    sockets[port]["socket"] = setupOutputSocket(query)
    sockets[port]["socket_type"] = "output"
    sockets[port]["socket_state"] = "init"
    sockets[port]["init"] = ""

    console.log("response")
    res.write(String(port))
    res.end()
    port++

  }


  if ( url == "/second") {

    if ( query == "" ) return;
    if ( ! ffplay_pipes[query] ) ffplay_pipes[query] = []
    ffplay_pipes[query].push( secondFF(query) )
    // sockets[port] = {}
    // sockets[port]["socket"] = setupOutputSocket(query)
    // sockets[port]["socket_type"] = "output"
    // sockets[port]["socket_state"] = "init"
    //
    console.log("response")
    // res.write(String(port))
    res.end()
    // port++


  }





}).listen(8000);




function buffering(buffer, port, flush) {

  var buffer = buffer || false;
  var port = port || false;

  var flush = flush || false;
  if (flush == true) console.log("flush")

  var concat_buffer;
  var length = 0;
  var chunk_size = 1024*1024*10

  buffer.forEach(function(item, i) {

    length = length + item.length;

  });

  concat_buffer = Buffer.concat(buffer, length)

  if ( ! sockets[port]["buffer"] ) {

    sockets[port]["buffer"] = concat_buffer;

  }

  else {

    sockets[port]["buffer"] = Buffer.concat( [sockets[port]["buffer"], concat_buffer ], sockets[port]["buffer"].length+concat_buffer.length );

  }



  console.log(sockets[port]["buffer"].length)


  while ( sockets[port]["buffer"].length > chunk_size) {

    writeout()

  }

  if ( sockets[port]["buffer"].length > 0 && flush) writeout()

  function writeout() {

    console.log("looping writes")


    if ( sockets[port]["buffer"].length > chunk_size || flush ) {

        if (flush == true) console.log("flush")

        sockets[port]["chunks"]++
        console.log("chunk: " + sockets[port]["chunks"])

        var data = sockets[port]["buffer"].slice(0,chunk_size)
        sockets[port]["buffer"] = sockets[port]["buffer"].slice(chunk_size)



        var stream_pipe = fs.createWriteStream("./chunks/stream"+port+".chunk."+sockets[port]["chunks"]);
        stream_pipe.write("");
        stream_pipe.write(data);

        // var chunk = sockets[port]["buffer"].slice(0, chunk_size)
        // sockets[port]["buffer"] = sockets[port]["buffer"].slice(chunk_size)

      }


    }



  return concat_buffer
}








function setupInputSocket(port=9999) {

  var port = port
  var buffer = []
  var socket_server = tls.createServer(server_options,function(socket) {
  sockets[port]["buffer"];

  console.log("CONNECTION ON SOCKET " + port)
    sockets[port]["socket_state"] = "connected"
    sockets[port]["chunks"] = 0


    console.log("FIFO: " + child_process.spawnSync("mkfifo", ["stream"+port]) )
    // sockets[port]["stream_pipe"] = stream_pipe;

    // var stream_pipe = fs.createWriteStream("./chunks/stream"+port+".init");
    var ffplay_started = false;
    // for (var k in stream_pipe) console.log(k)
    var chunks = 0;
    socket.on("data", function(data){

      var data = data;


      // console.log(data)
      // console.log(stream_pipe.bytesWritten)
      // stream_pipe.write(data);

      if ( sockets[port]["init"] == "" ) {

        console.log(data.length)


        sockets[port]["init"] = data.slice(0,4096)
        var stream_pipe = fs.createWriteStream("./chunks/stream"+port+".init");
        stream_pipe.write("");
        stream_pipe.write(sockets[port]["init"]);

        // console.log("first: " + data.length +" : "+ data)
        // var stream_pipe = fs.createWriteStream("./chunks/stream"+port+".init");
        // stream_pipe.write("");
        // stream_pipe.write(sockets[port]["init"]);

        // sockets[port]["ffplay"] = setupFF(port)

        data = data.slice(4096,data.length)

      }

      buffer.push(data)




      // var buffer

      // sockets[port]["buffer"].push(data)

      // if  ( ! sockets[port]["buffer"] ) {
      //
      //   sockets[port]["buffer"] = data
      //
      // }
      // else {
      //
      //   // Buffer.concat(buffer,buffer_size);
      // }

      //
      if ( buffer.length >= 2048 ) {

        buffering(buffer, port)
        buffer = []

        }


        // console.log(chunk.length)
        // console.log(sockets[port]["buffer"].length)

        // }
        // buffer = [];
        //
        //
        //
        // var buffer_size = 0;
        // buffer.forEach((item, i) => {
        //   buffer_size = buffer_size + item.length
        //
        //   // stream_pipe.write("");
        //   // stream_pipe.write(item);
        //   // delete sockets[port]["buffer"][i]
        // });
        // console.log(buffer_size)
        // var whole_buffer = Buffer.concat(buffer,buffer_size);
        // var bytes_writen = 0;
        // var chunk_size = 10*1024*1024*1024
        // while ( buffer_size > bytes_writen) {
        //   chunks++
        //
        //   var stream_pipe = fs.createWriteStream("./chunks/stream"+port+"."+chunks);
        //   buffer = sockets[port]["buffer"];
        //
        //   if ( whole_buffer.slice( (chunks-1)*chunk_size ) < chunk_size ) {
        //
        //     stream_pipe.write(whole_buffer.slice((chunks-1)*chunk_size))
        //
        //
        // }
        //
        // else {
        //   stream_pipe.write(whole_buffer.slice((chunks-1)*chunk_size,chunks*chunk_size))
        // }
        //
        //
        //   bytes_writen = bytes_writen + chunk_size



    // if ( stream_pipe.bytesWritten > 4096 && ffplay_started == false) {
    //
    //   ffplay_started = true;
    //
    // }

    })
    socket.on("connection", function(data){

      console.log("connect")

    })

    socket.on("close", function(data){

      console.log("CONNECION ON PORT " + port + " CLOSED")
      sockets[port]["socket_state"] = "disconnected"

      buffering(buffer, port, true)
      buffer = []



      // sockets[port]["buffer"] = Buffer.concat( [sockets[port]["init"], sockets[port]["buffer"] ], sockets[port]["init"].length+sockets[port]["buffer"].length )
      // console.log(sockets[port]["buffer"].length)


      // var stream_pipe = fs.createWriteStream("./stream"+port+".buffer");
      // stream_pipe.write("");
      // stream_pipe.write(sockets[port]["buffer"]);

      // for (var i = 0; i < sockets[port]["buffer"].length; i++) {
        // console.log(sockets[port]["ffplay"].stdin.write ( sockets[port]["buffer"][i] ) )
        // stream_pipe.write(sockets[port]["buffer"][i])

        // if ( ffplay_pipes[port] ) {

          // for ( var j = 0; j < ffplay_pipes.length;i++) {
            // ffplay[port][j].stdin.write( sockets[port]["buffer"][i] )

          // }
        // }

      // }
      sockets[port]["buffer"] = ""
      // sockets[port]["ffplay"] = setupFF(port)

      // ffplays.push( setupFF(port) )
      // while (buffer) {
      //   stream_pipe.write(buffer.shift())
      // }

    })

  });

  socket_server.listen(port, '0.0.0.0');

  return socket_server;
}


function setupOutputSocket(port=9999) {

  var port = port
  var buffer = []
  var socket_server = tls.createServer(server_options,function(socket) {
  sockets[port]["buffer"] = []
  var decoder = new string_decoder.StringDecoder('utf-8');
    var socket = socket
    console.log("CONNECTION ON SOCKET " + port)
    console.log("CREATING SOCKET FOR " + port)

    // console.log("FIFO: " + child_process.spawnSync("mkfifo", ["stream"+port]) )

    var stream_pipe = fs.createReadStream("stream"+port);
    sockets[port]["stream_pipe"] = stream_pipe;
    stream_pipe.pipe(socket)




    // for (var k in stream_pipe) console.log(k)
    socket.on("data", function(data){

      console.log(decoder.write(data))
      // console.log(data)

      // console.log(stream_pipe.bytesWritten)
      // stream_pipe.write(data);


    })
    socket.on("connection", function(data){

      console.log("connect")

    })

    socket.on("close", function(data){

      console.log("CONNECION ON PORT " + port + " CLOSED")


    })

  });

  socket_server.listen(port, '0.0.0.0');

  return socket_server;
}


function setupFF(port) {

      console.log("creating ffplay for port " + port)

      var ffplay = child_process.spawn("ffplay",["-"])
      // var ffplay = child_process.spawn("ffmpeg",["-re", "-i","stream"+port,"-f","null","-"]);
      var decoder = new string_decoder.StringDecoder('utf8');


      ffplay.stdout.on("data", function(data){

        // console.log(decoder.write(data))

      })
      ffplay.stderr.on("data", function(data){

        // console.log(decoder.write(data))
      })

      return ffplay;
  }


function secondFF(port) {
  var port = port;
  console.log("creating second ffplay for port " + port)

  var ffplay = child_process.spawn("ffplay",["-"])
  // var ffplay = child_process.spawn("ffmpeg",["-re", "-i","stream"+port,"-f","null","-"]);
  var decoder = new string_decoder.StringDecoder('utf8');
  ffplay.stdin.write(sockets[port]["init"])


  ffplay.stdout.on("data", function(data){

    console.log(decoder.write(data))

  })
  ffplay.stderr.on("data", function(data){

    // console.log(decoder.write(data))
  })

  return ffplay;

}





//
//
// net.createServer(function(socket) {
//   socket.write('data');
// });
