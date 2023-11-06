const socket = io.connect();
const currentUserId = localStorage.getItem("currentUserId");
const anotherUserId = window.location.pathname.split('/').pop();

const statusIconDict = {
    'undefined': 'question circle',
    'ok': 'smile icon',
    'help': 'frown icon',
    'emergency': 'exclamation triangle'
}
const statusColorDict = {'undefined': 'grey', 'ok': 'rgb(50, 178, 50)', 'help': 'rgb(248, 167, 37)', 'emergency': 'red'}

function scrollToBottom() {
    let messageList = document.getElementById("messageList");
    messageList.scrollTop = messageList.scrollHeight;
}

function senderMsgObj(message) {
    const localTime = new Date(message.createdAt).toLocaleString()
    return "<div class='message-box'><div class='sender-info'><span class='sender-name self'>" + message.senderName +
        " (Me)</span>" + " <i class='large icon " + statusIconDict[message.senderStatus] +
        "' style='color:" + statusColorDict[message.senderStatus] + "'>" + "</i></div><div class='message-content'><p>" + message.content
        + "</p><span class='timestamp'>" + localTime + "</span></div></div>"
}

function receiverMsgObj(message) {
    const localTime = new Date(message.createdAt).toLocaleString()
    return "<div class='message-box'><div class='sender-info'><span class='sender-name'>" + message.senderName
        + "</span> <i class='large icon " + statusIconDict[message.senderStatus] + "' style='color:" + statusColorDict[message.senderStatus] + "'>"
        + "</i></div><div class='message-content'><p>" + message.content + "</p><span class='timestamp'>" + localTime + "</span></div></div>"
}

function sendMessage() {
    let messageContent = $("#messageInput").val();

    // Post new private message
    if (messageContent.trim() !== "") {
        postMessage(messageContent);
    }
}



const renderNewMessage = function (message) {
    if ((currentUserId === message.senderId || currentUserId === message.receiverId) && (anotherUserId === message.receiverId || anotherUserId === message.senderId)) {
        if (currentUserId === message.senderId) {
            $("#messageList").append(senderMsgObj(message));
        } else {
            $("#messageList").append(receiverMsgObj(message));
        }
        
        if (currentUserId === message.receiverId) {
            cancelAlert();
        }
        
        scrollToBottom();
    }
};

function postMessage(messageContent) {
    $.ajax({
        method: 'POST',
        url: '/messages/private',
        data: {
            receiverId: anotherUserId,
            content: messageContent,
        }
    }).done(function (response) {
        $("#messageInput").val("");
    }).fail(function (response) {
        console.error('Failed to send message:', response);
    });
}

function addElementsBehavior() {
    $("#sendMessageBtn").click(function () {
        sendMessage();
    });
    
    $('#messageInput').on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
}

function cancelAlert() {
    $.ajax({
        method: 'POST',
        url: '/messages/private/cancelAlert',
        data: {
            senderId: anotherUserId,
            receiverId: currentUserId,
        }
    }).done(function () {
        console.log("alert cancelled");
    }).fail(function () {
        console.error('Failed to cancel alert:');
    });
}


$(document).ready(function () {
    scrollToBottom();

    // Cancel alert first
    cancelAlert();

    addElementsBehavior();
});
socket.on('newPrivateMessage', renderNewMessage);