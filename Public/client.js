var username;
var color;


$(function () {
    console.log("Hello?");
    var socket = io();
    socket.emit('join');


    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });


    socket.on('chat message', function(msg){
        var messageObj = JSON.parse(msg);
        if (username === messageObj.uname){
            $('#messages').append("<li><b>" + messageObj.timestamp +
                " <span style=\"color: " + messageObj.color + ";\">" +
                messageObj.uname + "</span>: " +
                messageObj.message + "</b></li>");
        }
        else{
            console.log(messageObj.color);
            $('#messages').append("<li>" + messageObj.timestamp +
                " <span style=\"color: " + messageObj.color + ";\">" +
                messageObj.uname + "</span>: " +
                messageObj.message + "</li>");
        }

        updateScroll();
    });

    //When we refresh the list of users
    socket.on('users update', function(userList){
        console.log(userList);
        var userArray=userList.split(",");
        $('#users').html(makeUL(userArray));
    })

    //Person left message
    socket.on('user left', function(lostPerson){
        $('#messages').append($('<li>').text(lostPerson+" has disconnected"));
    });

    //New person message
    socket.on('user connect', function(newPerson){
        $('#messages').append($('<li>').text(newPerson+" has joined the chat"));
    });
    //set their name
    socket.on('get name', function(name){
        $("#username").text(name);
        username=name;
    });
    //Set the user color
    socket.on('get color', function(newcolor){
        $("#username").css('color', newcolor);
        color=newcolor;
    });

    //Goes through last 200 messages and displays it
    socket.on('set messages', function(messagingHistory){
        messagingHistory.forEach(function (msg) {
            var messageObj = JSON.parse(msg);
                $('#messages').append("<li>" + messageObj.timestamp +
                    " <span style=\"color: " + messageObj.color + ";\">" +
                    messageObj.uname + "</span>: " +
                    messageObj.message + "</li>");
            updateScroll();

        })
    });

});

function makeUL(array) {
    // Create the list element:
    var list = document.createElement('ul');
    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');
        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));
        // Add it to the list:
        list.appendChild(item);
    }
    // Finally, return the constructed list:
    return list;
}

function updateScroll(){
    var element = document.getElementById("messageList");
    element.scrollTop = element.scrollHeight;
}