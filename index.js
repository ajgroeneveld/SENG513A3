var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var people =[];


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', people[socket.id]+": "+msg);
  });
  socket.on('join', function(){
      console.log(people);
      people[socket.id]="User"+Object.keys(people).length;

    });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
