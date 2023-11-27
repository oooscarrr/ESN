import * as searchBox from './searchBox.js';

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

    $('.ui.radio.checkbox').checkbox();

    // Find nearby people button
    $('#findNearbyPeople').click(getGeolocation);
});
