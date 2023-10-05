const socket = io.connect();

function scrollToBottom() {
    let messageList = document.getElementById("messageList");
    messageList.scrollTop = messageList.scrollHeight;
}

$(document).ready(function() {
    scrollToBottom();

    $("#sendMessageBtn").click(function() { 
        let messageContent = $("#messageInput").val();
    
        if(messageContent.trim() !== "") {
            $.ajax({
                method: 'POST',
                url: '/messages/public', 
                data: {
                    content: messageContent,
                }
            }).done(function(response) {
                $("#messageInput").val(""); 
            }).fail(function(response) {
                console.error('Failed to send message:', response);
            });
        }
    });
});

socket.on('newPublicMessage', function(message) {
    $("#messageList").load(location.href + " #messageList");
    scrollToBottom();
});



// const post_load = () => {
//     $('#logoutButton').click(function () {
//       $.ajax({
//         method: 'POST',
//         url: '/users/logout',
//       }).done(function () {
//         socket.disconnect();
//         window.location.href = '/';
//       });
//     });
//   };

  $(document).on('click', '#logoutButton', function (event) {
    event.preventDefault();  // Prevent the anchor tag's default behavior

    $.ajax({
        method: 'POST',
        url: '/users/logout',
    }).done(function () {
        socket.disconnect();
        window.location.href = '/';
    });
});

  