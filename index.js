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
      console.log(msg);
      var messageObj='{'+'"uname":"'+people[socket.id]+'", "message":"'+msg+'","timestamp":"'+Date.now()+'"}';
      console.log(messageObj);
    io.emit('chat message', messageObj);

  });
  socket.on('join', function(){
      console.log("user joined");
      people[socket.id]="User"+parseInt(Object.keys(people).length+1);
      UpdatePeople(people);
      io.emit('user connect', people[socket.id]);
    });


  socket.on('disconnect', function(){
      console.log('user disconnected');
      io.emit('user left', people[socket.id]);
      delete people[socket.id];
      UpdatePeople(people);
    });

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});


function UpdatePeople(people){
    var people_emit="";
    for(i in people) {
        if (people_emit===""){people_emit=people[i];}
        else{people_emit=people_emit+","+people[i];}
    }
    io.emit('users update', people_emit);

}