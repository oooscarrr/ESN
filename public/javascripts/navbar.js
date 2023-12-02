import * as searchBox from './searchBox.js';
const socket = io.connect();
window.socket = socket;
const UserId = localStorage.getItem("currentUserId");

socket.on('connect', function () {
    console.log("WebSocket Connected: ", socket.connected);

    socket.on('receiveSosAlert', function (data) {
        console.log("Received SOS Alert: ", data);
        const message = `SOS Alert from ${data.message}`;
        alert(message);
    });
});


const socket = io.connect();

const sendLogoutRequest = function () {
    $.ajax({
        method: 'POST',
        url: '/users/logout',
    }).done(function () {
        localStorage.removeItem("currentUserId");
        socket.disconnect();
        window.location.href = '/';
    });
};
const sendStatusChangeRequest = function (e) {
    e.preventDefault();
    const data = $(this).serialize();
    $.ajax({
        method: 'POST',
        url: '/users/status',
        data: data
    }).done(function () {
        $('#changeStatusModal').modal('hide');
        if (location.pathname === '/users') {
            location.reload();
        }
    });
};
const toggleSearchBoxVisibility = function () {
    $('#searchBox').transition('fade', '500ms');
}

const getSosLocationAndSendMessage = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            const { latitude, longitude } = position.coords;
            console.log("Location obtained: Lat:", latitude, "Long:", longitude); // Log the coordinates
            sendSosAlert(latitude, longitude);
        }, function () {
            alert('Unable to retrieve your location');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
};


const sendSosAlert = (latitude, longitude) => {
    const userId = localStorage.getItem("currentUserId");
    // console.log(0, userId);
    const fetchUserSosMessage = (userId) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: 'GET',
                url: `/users/sos-message/${userId}`,
                success: function (response) {
                    if (response && response.sosMessage) {
                        console.log('User SOS Message:', response.sosMessage,);
                        resolve({ sosMessage: response.sosMessage, username: response.username });
                    } else {
                        console.error('SOS message not found for this user.');
                        reject('SOS message not found');
                    }
                },
                error: function (err) {
                    console.error('Error fetching user SOS message:', err);
                    reject(err);
                }
            });
        });
    };
    // console.log(1, userId);
    if (userId) {
        fetchUserSosMessage(userId)
            .then(({ sosMessage, username }) => {
                console.log('Received SOS Message:', sosMessage);
                // Do something with the sosMessage
                // $('#sosMessageDisplay').text(sosMessage);

                console.log(sosMessage);
                const fullMessage = `${username}: ${sosMessage} My current location: Lat ${latitude}, Long ${longitude}`;
                console.log("Full SOS message:", fullMessage);

                $.ajax({
                    url: '/users/sos/alert',
                    method: 'POST',
                    data: { userId, message: fullMessage },
                    success: function (response) {
                        console.log('SOS alert sent:', response.message);
                    },
                    error: function (err) {
                        console.error('Error sending SOS alert:', err);
                    }
                });


            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
};

function ableToGetLocation(position) {
    // Update user geolocation
    $.ajax({
        method: 'POST',
        url: '/users/geolocation',
        data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        }
    }).done(function () {
        // Remove the loading message
        hideLoadingIndicator();
        // Redirect to nearbypeople page
        window.location.href = '/nearbypeople';
    }).fail(function (response) {
        console.error('Failed to update geolocation', response);
    });
}

function unableToGetLocation() {
    alert("Please enable your location sharing.");
    // Remove the loading message
    hideLoadingIndicator();
}

function hideLoadingIndicator() {
    // Hide the loading indicator using Fomantic UI classes
    $("#loading-message").remove();
}

function getGeolocation() {
    if ("geolocation" in navigator) {
        // Display the loading message
        var loadingMessage = document.createElement("div");
        loadingMessage.id = "loading-message";
        loadingMessage.className = "ui active dimmer";
        loadingMessage.innerHTML = `<div class="ui text loader">Loading...</div>`;
        document.body.appendChild(loadingMessage);
        
        navigator.geolocation.getCurrentPosition(ableToGetLocation, unableToGetLocation, {timeout:10000});
    } else {
        alert("Geolocation data not available")
    }
}

$(document).ready(() => {
    $('#logoutButton').click(sendLogoutRequest);

    $('.ui.dropdown').dropdown();

    searchBox.initializeSearchBox();

    // searchDropdown();
    // searchBox.showSearchDropdown(context);
    $('#navbarSearchButton').click(toggleSearchBoxVisibility);
    $('#changeStatusModal').modal('attach events', '#changeStatusButton', 'show');
    $('#changeStatusForm').submit(sendStatusChangeRequest);

    $('#sosButton').click(getSosLocationAndSendMessage);



});

// function searchDropdown() {
//     if (isUserSearch()) {
//         $('#categorySelect').show();
//     }

//     // Prevent closing the dropdown when interacting with the input and button
//     $('.ui.action.input').on('click', function (e) {
//         e.stopPropagation();
//     });


//     $('.ui.action.input button').on('click', function (e) {
//         e.stopPropagation();
//         search();
//         clearSearchInput();
//     });

//     // Listen for keydown event on the input to handle the Enter key press
//     $('.ui.action.input input').on('keydown', function (e) {
//         e.stopPropagation();
//         if (e.which === 13) {
//             search();
//             clearSearchInput(); // Call the function to clear the input
//         }
//     });
// }
// function isUserSearch() {
//     var currentPathname = window.location.pathname;
//     console.log((currentPathname));
//     if(currentPathname == '/users'){
//         return true;
//     }
//     return false;
// }
// function clearSearchInput() {
//     $('.ui.action.input input').val('');
// }

    $('.ui.radio.checkbox').checkbox();

    // Find nearby people button
    $('#findNearbyPeople').click(getGeolocation);
});
