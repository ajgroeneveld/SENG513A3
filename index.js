
var express = require("express");
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var people =[];
var color = [];
var messagingHistory = [];

app.use('/Public', express.static(__dirname + '/Public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/Public/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
      if (msg.startsWith("/nick ")) {
          people[socket.id]=msg.substr(6, msg.length - 6).trim();
          socket.emit('get name', people[socket.id]);
          UpdatePeople(people);
      }
      else if (msg.startsWith("/nickcolor ")) {
          color[socket.id]=msg.substr(11, msg.length - 11).trim();
          socket.emit('get color', people[socket.id]);
      }
      else{
          console.log(msg);

          var date = new Date();
          var messageObj='{'+'' +
              '"uname":"'+people[socket.id]+'", ' +
              '"message":"'+msg+'",' +
              '"timestamp":"'+FormatTime(date)+'",'+
              '"color":"'+color[socket.id]+
              '"}';
          console.log(messageObj);
          io.emit('chat message', messageObj);
          if (messagingHistory.length > 200){
              messagingHistory.shift();
          }
          messagingHistory.push(messageObj);}

  });

  socket.on('join', function(){
      console.log("user joined");
      people[socket.id]="User"+parseInt(Object.keys(people).length+1);
      color[socket.id]="#000000";
     // socket.emit("messaging history", messagingHistory);
      UpdatePeople(people);
      io.emit('user connect', people[socket.id]);
      socket.emit('get name', people[socket.id]);
      socket.emit('set messages', messagingHistory);
    });


  socket.on('disconnect', function(){
      console.log('user disconnected');
      io.emit('user left', people[socket.id]);
      delete people[socket.id];
      delete color[socket.id];
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

function FormatTime(date) {
    var hour = date.getHours();
    var minutes = date.getMinutes();
    if (hour < 10)
        hour = "0" + hour;
    if (minutes < 10)
        minutes = "0" + minutes;
    return hour + ":" + minutes;
}

