// Get currentGroupId
const path = window.location.pathname;
const pathSegments = path.split('/');
const currentGroupId = pathSegments[pathSegments.length - 1];

const currentUserId = localStorage.getItem("currentUserId");

const socket = io.connect();
socket.on('newGroupMessage', renderNewGroupMessage);

const statusIconDict = {
    'undefined': 'question circle',
    'ok': 'smile icon',
    'help': 'frown icon',
    'emergency': 'exclamation triangle'
}
const statusColorDict = {
    'undefined': 'grey', 
    'ok': 'rgb(50, 178, 50)', 
    'help': 'rgb(248, 167, 37)', 
    'emergency': 'red'
}

function scrollToBottom() {
    let messages = document.getElementById("messageList");
    messages.scrollTop = messages.scrollHeight;
}


function senderMsgObj(message) {
    const localTime = new Date(message.createdAt).toLocaleString()
    return "<div class='message-box'><div class='sender-info'><span class='sender-name self'>" + message.senderName
        + " (Me)</span>" + " <i class='large icon " + statusIconDict[message.senderStatus]
        + "' style='color:" + statusColorDict[message.senderStatus] + "'>" + "</i></div><div class='message-content'><p>" + message.content
        + "</p><span class='timestamp'>" + localTime + "</span></div></div>"
}

function receiverMsgObj(message) {
    const localTime = new Date(message.createdAt).toLocaleString()
    return "<div class='message-box'><div class='sender-info'><span class='sender-name'>" + message.senderName
        + "</span> <i class='large icon " + statusIconDict[message.senderStatus] + "' style='color:" + statusColorDict[message.senderStatus]
        + "'>" + "</i></div><div class='message-content'><p>" + message.content + "</p><span class='timestamp'>" + localTime + "</span></div></div>"
}

function renderNewGroupMessage(message) {
    console.log("SOCKET: ", message);
    if (message.groupId === currentGroupId) {
        if (currentUserId === message.senderId) {
            $("#messageList").append(senderMsgObj(message));
        } else {
            $("#messageList").append(receiverMsgObj(message));
        }
        scrollToBottom();
    }
}

function messageSendHandler() {
    // Get input values
    const input = $('#messageInput').val();

    if (input.trim() === "") {
        alert("Message input cannot be empty or contain only whitespaces");
    } else {
        $('#messageInput').val('');
        // Call post message API
        $.ajax({
            method: 'POST',
            url: '/groups/messages',
            data: {
                groupId: currentGroupId,
                input: input,
            }
        }).done(function () {
        }).fail(function (response) {
            alert(response.responseText);
        });
    }
}


$(document).ready(function () {
    scrollToBottom();
    // Handle confirm button click
    $('#sendMessageBtn').click(messageSendHandler);
});