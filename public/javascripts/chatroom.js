const socket = io.connect();

function retrieveAndDisplayMessages() {
    $.ajax({
        method: 'GET',
        url: '/messages/public',
    }).done(function (messages) {
        messages.forEach(message => {
            appendMessage(message);
        });
        scrollToBottom();
    }).fail(function (response) {
        console.error('Failed to retrieve messages:', response);
    });
}

function isScrolledToBottom(el) {
    return el.scrollHeight - el.scrollTop === el.clientHeight;
}

function scrollToBottom() {
    let messageList = document.getElementById("messageList");
    messageList.scrollTop = messageList.scrollHeight;
}

function appendMessage(message) {
    let messageList = document.getElementById("messageList");
    
    let shouldScroll = isScrolledToBottom(messageList);

    let messageItem = `
    <div class="message-box">
        <div class="sender-info">
            <span class="sender-name">${message.senderName} <span class="user-status">(${message.userStatus})</span></span>
        </div>
        <div class="message-content">
            ${message.content}
            <span class="timestamp">${new Date(message.createdAt).toLocaleString()}</span>
        </div>
    </div>`;

    $("#messageList").append(messageItem); 

    if (shouldScroll) {
        scrollToBottom();
        // Scroll to the bottom after adding a message
    $("#messageList").scrollTop($("#messageList")[0].scrollHeight);
    }
}

$(document).ready(function() {
    retrieveAndDisplayMessages();

    $("#sendMessageBtn").click(function() { 
        // const userId = localStorage.getItem('userId');
        let messageContent = $("#messageInput").val();
    
        if(messageContent.trim() !== "") {
            $.ajax({
                method: 'POST',
                url: '/messages/public', 
                headers:{
                    Authorization:'Bearer ' + token
                },
                data: {
                    // userId: userId,
                    content: messageContent,
                }
            }).done(function(response) {
                $("#messageInput").val(""); 
            }).fail(function(response) {
                console.error('Failed to send message:', response);
            });
        }
    });

    // $("#backButton").click(function() {
    //     window.location.href = "/esn.js"; 
    // });
});

socket.on('newPublicMessage', function(message) {
    appendMessage(message);
});