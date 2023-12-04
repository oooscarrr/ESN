const UserId = localStorage.getItem("currentUserId");

function socketConnect(socket) {
    socket.on('connect', function () {
        console.log("WebSocket Connected: ", socket.connected);
    });
}

function socketMsgReceived(socket) {
    socket.on('sosRequestReceived', function (data) {
        console.log("Received 'sosRequestReceived' event:", data);
        if (data.action === 'received') {
            // Dynamically add the new request to the incoming requests list
           appendReq(data);
        }
    });
}

function appendReq(data){
    $('#IncomingRequests .ui.relaxed.divided.list').append(
        '<div class="item user-row">' +
        '<i class="big user icon"></i>' +
        '<div class="content">' +
        '<div class="username">' + data.fromUsername + '</div>' +
        '<button class="ui button acceptSOS" onclick="acceptSosRequest(\'' + data.from + '\')">Accept</button>' +
        '<button class="ui button rejectSOS" onclick="rejectSosRequest(\'' + data.from + '\')">Reject</button>' +
        '</div>' +
        '</div>'
    );
}

function socketReqFinished(socket) {
    socket.on('sosRequestFinished', function (data) {
        $('#IncomingRequests .user-row').filter(function () {
            return $(this).find('.rejectSOS').attr('onclick').includes(data.by);
        }).remove();
    });
}

function socketReqAcceptedRe(socket) {
    socket.on('sosRequestAcceptedRecipient', function (data) {
        console.log("SOS request accepted by:", data.byUsername);
        // Find the row corresponding to the user who accepted the request
        $("#UserLists .user-row").filter(function () {
            return $(this).text().indexOf(data.byUsername) > -1;
        }).remove();

        $('#ConnectedContacts .ui.relaxed.divided.list').append(
            '<div class="item user-row">' +
            '<i class="big user icon"></i>' +
            '<div class="content">' +
            '<div class="username">' + data.byUsername + '</div>' +
            '<span class="sosContact">SOS Contact</span>' +
            '</div>' +
            '</div>'
        );
    });
}


function reqAcceptedSender(socket) {
    socket.on('sosRequestAcceptedSender', function (data) {
        // Find the row corresponding to the user who accepted the request
        $("#UserLists .user-row").filter(function () {
            return $(this).text().indexOf(data.byUsername) > -1;
        }).remove();

        $('#ConnectedContacts .ui.relaxed.divided.list').append(
            '<div class="item user-row">' +
            '<i class="big user icon"></i>' +
            '<div class="content">' +
            '<div class="username">' + data.byUsername + '</div>' +
            '<span class="sosContact">SOS Contact</span>' +
            '</div>' +
            '</div>'
        );
    });
}


function reqRej(socket) {
    socket.on('sosRequestRejectedRecipient', function (data) {
        console.log("SOS request rejected by:", data.byUsername);
        // Find the button associated with the user who rejected the request
        var button = $("button.pendingSOS").filter(function () {
            return $(this).data('userId') === data.userId;
        });
        // Check if the button is correctly identified
        console.log("Button found for user ID:", data.userId, "; Button exists:", button.length > 0);
        // Update the button to revert it to its original state
        if (button.length > 0) {
            button.text('Send Request')
                .removeClass('pendingSOS')
                .attr('disabled', false)
                .attr('onclick', 'sendSosRequest("' + data.userId + '")');
            // Create and insert the rejection message
            var rejectionMsg = $('<span class="rejection-message" style="color: red;">Rejected!</span>');
            button.after(rejectionMsg);
            // Fade out the message after a few seconds
            setTimeout(function () {
                rejectionMsg.fadeOut(1000, function () {
                    rejectionMsg.remove();
                });
            }, 3000);
        }
    });
}

$(document).ready(function () {
    const socket = window.socket;
    getPresetMessage();
    addMsgFormBehavior();
    socketConnect(socket);
    socketMsgReceived(socket);
    socketReqFinished(socket);
    socketReqAcceptedRe(socket);
    reqAcceptedSender(socket);
    reqRej(socket);
});


function addMsgFormBehavior() {
    $('#sosMessageForm').submit(function (e) {
        e.preventDefault(); // Prevent the default form submission
        const sosMessage = $('textarea[name="sosMessage"]').val();
        // Send an AJAX request to update the SOS message
        $.ajax({
            url: '/users/sos/updateMessage',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({sosMessage: sosMessage}),
            success: function (response) {
                $('textarea[name="sosMessage"]').val('');
                $('#sosMessageDisplay').text(sosMessage);
            },
            error: function (err) {
                console.error('Error updating SOS message:', err);
            }
        });
    });
}

function getPresetMessage() {
    $.ajax({
        url: `/users/sos-message/${UserId}`,
        method: 'GET',
        success: function (response) {
            if (response.sosMessage) {
                $('#sosMessageDisplay').text('Your current SOS Message: ' + response.sosMessage);
            }
        },
        error: function (err) {
            console.error('Error fetching SOS message:', err);
        }
    });
}

function sendSosRequest(userId) {
    console.log("Sending SOS request to user ID:", userId);
    $.ajax({
        url: '/users/sos/send',
        method: 'POST',
        data: {userId: userId},
        success: function (response) {
            console.log(userId, "SOS request sent successfully. Response:", response);
            // Update the button to show 'Pending'
            var button = $("button[onclick='sendSosRequest(\"" + userId + "\")']");
            console.log("Button found:", button.length > 0); // Check if the button is correctly identified
            button.text('Pending').addClass('pendingSOS').attr('disabled', true).attr('onclick', '');
        },
        error: function (err) {
            console.error('Error sending SOS request:', err);
        }
    });
}

function acceptSosRequest(userId) {
    $.ajax({
        url: '/users/sos/accept',
        method: 'POST',
        data: {userId: userId},
        success: function (response) {
            // Find the Accept and Reject buttons and remove them
            $('button[onclick="acceptSosRequest(\'' + userId + '\')"]').siblings('button').remove();
            // Update the Accept button to show 'SOS Contact' and disable it
            $('button[onclick="acceptSosRequest(\'' + userId + '\')"]')
                .text('SOS Contact')
                .attr('disabled', true)
                .removeClass('acceptSOS')
                .addClass('sosContact')
                .removeAttr('onclick'); // Remove the onclick attribute
        },
        error: function (err) {
            console.error('Error accepting SOS request:', err);
        }
    });
}

function rejectSosRequest(userId) {
    $.ajax({
        url: '/users/sos/reject',
        method: 'POST',
        data: {userId: userId},
        success: function (response) {
            // Update UI to remove the reject/accept buttons
            $('button[onclick="rejectSosRequest(\'' + userId + '\')"]')
                .parent() // or whichever selector that targets the entire button set
                .remove();
        },
        error: function (err) {
            console.error('Error rejecting SOS request:', err);
        }
    });
}
