
//We want to save username and color locally
var username;
var color;

//When we load
$(function () {
   // console.log("Hello?");
    var socket = io(); //Start the socket
    socket.emit('join'); //Set up on the server
    var cookie = document.cookie.split("="); //Check if we previously had a Username
    if (cookie[0]==="username"){    //If we did, set the username to the old one
        socket.emit('chat message', "/nick "+cookie[1]) //I know
    }


    //The form submission
    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });

    //Message comes in and we turn it to JSON and parse
    socket.on('chat message', function(msg){
        var messageObj = JSON.parse(msg);
        //Bold if it came from you
        if (username === messageObj.uname){
            $('#messages').append("<li><b>" + messageObj.timestamp +
                " <span style=\"color: " + messageObj.color + ";\">" +
                messageObj.uname + "</span>: " +
                messageObj.message + "</b></li>");
        }
        //Normal if it didn't
        else{
            console.log(messageObj.color);
            $('#messages').append("<li>" + messageObj.timestamp +
                " <span style=\"color: " + messageObj.color + ";\">" +
                messageObj.uname + "</span>: " +
                messageObj.message + "</li>");
        }
        //Scroll to the new message
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
        $('#messages').append($("<li><i>" + lostPerson +" has disconnected"+"</i></li>"));
    });

    //New person message
    socket.on('user connect', function(newPerson){
        $('#messages').append($("<li><i>" + newPerson +" has joined the chat"+"</i></li>"));
    });

    socket.on('username change', function(changeString){
        var names = changeString.split(",");
        $('#messages').append($("<li><i>" + names[0] +" has changed their name to "+names[1]+"</i></li>"));
    });

    //set their name
    socket.on('get name', function(name){
        $("#username").text(name);
        username=name;
        document.cookie = "username=" + name + ";";
      //  console.log(document.cookie);
    });
    //Set the user color
    socket.on('get color', function(newcolor){
        //$("#username").css("color", newcolor); Can't get this to work
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