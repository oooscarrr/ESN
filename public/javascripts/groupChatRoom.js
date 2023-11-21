// Get currentGroupId
const path = window.location.pathname;
const pathSegments = path.split('/');
const currentGroupId = pathSegments[pathSegments.length - 1];

const currentUserId = localStorage.getItem("currentUserId");

const socket = io.connect();

socket.on('newGroupMessage', renderNewGroupMessage);

socket.on('newJoiner', async (groupId) => {
    if (currentGroupId === groupId) {
        location.reload(true);
    }
});

socket.on('newGroupName', async (groupId) => {
    if (currentGroupId === groupId) {
        location.reload(true);
    }
});

socket.on('deleteGroup', async (groupId) => {
    if (currentGroupId === groupId) {
        window.location.href = '/groups';
    }
});

socket.on('leaveGroup', async (groupId) => {
    if (currentGroupId === groupId) {
        location.reload(true);
    }
});

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

// Onclick declared in nearbyPeople.pug
function showUserListModal(userList) {
    const modal = $('#userListModal');
    modal.find('.content').empty();
    userList.forEach(user => {
      modal.find('.content').append(`<div>${user.username}</div>`);
    });
  
    modal.modal('show');
}

// Onclick declared in nearbyPeople.pug
function closeUserListModal() {
    $('#userListModal').modal('hide');
}

// Onclick declared in nearbyPeople.pug
function handleChangeGroupName() {
    $('#groupNameInput').val('');
    const modal = $('#newGroupNameModal');
    modal.modal('show');
}

function cancelGroupNameChange() {
    $('#newGroupNameModal').modal('hide');
}

function confirmGroupNameChange(groupId) {
    // Get input values
    let newGroupName = $('#groupNameInput').val().trim();

    // Group name input cannot be empty or contain only whitespaces
    if (newGroupName === "") {
        alert("Group name input cannot be empty or contain only whitespaces");
        $('#groupNameInput').val('');
    } else {
        $.ajax({
            method: 'POST',
            url: '/groups/name',
            data: {
                groupId: groupId,
                newGroupName: newGroupName
            }
        }).done(function () {
            $('#newGroupNameModal').modal('hide');
        }).fail(function (response) {
            alert(response.responseText);
            $('#groupNameInput').val('');
        });
    }
}

// Onclick declared in nearbyPeople.pug
function handleChangeGroupDescription() {
    $('#DescriptionInput').val('');
    const modal = $('#newDescriptionModal');
    modal.modal('show');
}

function cancelDescriptionChange() {
    $('#newDescriptionModal').modal('hide');
}

function confirmDescriptionChange(groupId) {
    // Get input values
    let newDescription = $('#descriptionInput').val().trim();

    if (newDescription === "") {
        alert("Group description input cannot be empty or contain only whitespaces");
        $('#descriptionInput').val('');
    } else {
        $.ajax({
            method: 'POST',
            url: '/groups/description',
            data: {
                groupId: groupId,
                newDescription: newDescription
            }
        }).done(function () {
            $('#newDescriptionModal').modal('hide');
        }).fail(function (response) {
            alert(response.responseText);
            $('#descriptionInput').val('');
        });
    }
}

// Onclick declared in nearbyPeople.pug
function handleLeaveGroup() {
    const modal = $('#leaveGroupModal');
    modal.modal('show');
}

function cancelLeaveGroup() {
    $('#leaveGroupModal').modal('hide');
}

function confirmLeaveGroup(groupId) {
    $.ajax({
        method: 'POST',
        url: '/groups/leave',
        data: {
            groupId: groupId,
        }
    }).done(function () {
        $('#leaveGroupModal').modal('hide');
        window.location.href = '/groups';
    }).fail(function (response) {
        alert(response.responseText);
    });
}


$(document).ready(function () {
    scrollToBottom();
    // Handle confirm button click
    $('#sendMessageBtn').click(messageSendHandler);

    $('#messageInput').on("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            messageSendHandler();
        }
    });
});