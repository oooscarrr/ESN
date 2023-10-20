const socket = io.connect();

function scrollToBottom() {
    let messageList = document.getElementById("messageList");
    messageList.scrollTop = messageList.scrollHeight;
}

function msgObj(message) {
    const localTime = new Date(message.createdAt).toLocaleString()
    return "<div class='message-box'><div class='sender-info'><span class='sender-name'>" + message.senderName + "<span class='user-status'>" + message.userStatus + "</span></span></div><div class='message-content'><p>" + message.content + "</p><span class='timestamp'>" + localTime + "</span></div></div>"
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
    $("#messageList").append(msgObj(message))
    scrollToBottom();
});