const socket = io.connect();
const UserId = localStorage.getItem("currentUserId");


// Listener for socket connection
socket.on('connect', function() {
    console.log("WebSocket Connected: ", socket.connected);

    socket.on('receiveSosAlert', function(data) {
        console.log("Received SOS Alert: ", data);
        const message = `SOS Alert from ${data.from}: ${data.message}`;
        alert(message); // Or use a modal/pop-up to display the message
    });
    console.log("Listener setup completed"); // Add this line
    });

$(document).ready(function() {
    $('#sosMessageForm').submit(function(e) {
        e.preventDefault(); // Prevent the default form submission
        const sosMessage = $('textarea[name="sosMessage"]').val();
        // Send an AJAX request to update the SOS message
        $.ajax({ 
            url: '/users/sos/updateMessage',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ sosMessage: sosMessage }),
            success: function(response) {
                console.log('Success callback executed.'); // Add this line
                console.log('Response data:', response); // Add this line
                console.log('SOS alert sent:', response.message);
                console.log('SOS message:', response.sosMessage); // Add this line
            },
            
            error: function(err) {
                console.error('Error updating SOS message:', err);
            }
        });
    });

    $('#sosButton').click(function() {
        console.log('SOS Button Clicked');
        const userId = localStorage.getItem("currentUserId"); 
        const sosMessage = $('textarea[name="sosMessage"]').val(); // Get the SOS message from an input field
    
        $.ajax({
            url: '/users/sos/alert',
            method: 'POST',
            data: { userId, sosMessage },
            success: function(response) {
                console.log('SOS alert sent:', response.message);
            },
            error: function(err) {
                console.error('Error sending SOS alert:', err);
            }
        });
    });
    });
   

// Function to send an SOS request
function sendSosRequest(userId) {
    console.log("Sending SOS request to user ID:", userId); 
    $.ajax({
        url: '/users/sos/send',
        method: 'POST',
        data: { userId: userId },
        success: function(response) {
            console.log("SOS request sent successfully. Response:", response); // Check server response

            // Update the button to show 'Pending'
            var button = $("button[onclick='sendSosRequest(\"" + userId + "\")']");
            console.log("Button found:", button.length > 0); // Check if the button is correctly identified
            button.text('Pending').addClass('pendingSOS').attr('disabled', true).attr('onclick', '');
        },
        error: function(err) {
            console.error('Error sending SOS request:', err);
        }
    });
}

function acceptSosRequest(userId) {
    $.ajax({
        url: '/users/sos/accept',
        method: 'POST',
        data: { userId: userId },
        success: function(response) {
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
        error: function(err) {
            console.error('Error accepting SOS request:', err);
        }
    });
}


// Function to reject an SOS request
function rejectSosRequest(userId) {
    $.ajax({
        url: '/users/sos/reject',
        method: 'POST',
        data: { userId: userId },
        success: function(response) {
            // Update UI to remove the reject/accept buttons
            $('button[onclick="rejectSosRequest(\'' + userId + '\')"]')
                .parent() // or whichever selector that targets the entire button set
                .remove();
        },
        error: function(err) {
            console.error('Error rejecting SOS request:', err);
        }
    });
}



