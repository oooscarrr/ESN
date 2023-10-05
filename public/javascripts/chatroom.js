const socket = io.connect();

function scrollToBottom() {
    let messageList = document.getElementById("messageList");
    messageList.scrollTop = messageList.scrollHeight;
}

$(document).ready(function() {
    scrollToBottom();

    $("#sendMessageBtn").click(function() { 
        // const userId = localStorage.getItem('userId');
        let messageContent = $("#messageInput").val();
    
        if(messageContent.trim() !== "") {
            $.ajax({
                method: 'POST',
                url: '/messages/public', 
                // headers:{
                //     Authorization: 'Bearer ' + Cookies.get('token')
                // },
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