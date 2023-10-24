const socket = io.connect();

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

function msgObj(message) {
    const localTime = new Date(message.createdAt).toLocaleString()
    return "<div class='message-box'><div class='sender-info'><span class='sender-name'>" + message.senderName
        + "</span> <i class='large icon " + statusIconDict[message.userStatus] + "' style='color:" + statusColorDict[message.userStatus] + "'>"
        + "</i></div><div class='message-content'><p>" + message.content + "</p><span class='timestamp'>" + localTime + "</span></div></div>"
}

function sendMessage() {
    let messageContent = $("#messageInput").val();

    if (messageContent.trim() !== "") {
        $.ajax({
            method: 'POST',
            url: '/messages/public',
            data: {
                content: messageContent,
            }
        }).done(function (response) {
            $("#messageInput").val("");
        }).fail(function (response) {
            console.error('Failed to send message:', response);
        });
    }
}

$(document).ready(function () {
    scrollToBottom();

    $("#sendMessageBtn").click(function () {
        sendMessage();
    });

    $('#messageInput').on("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            sendMessage();
        }
    });
});

socket.on('newPublicMessage', function (message) {
    $("#messageList").append(msgObj(message))
    scrollToBottom();
});