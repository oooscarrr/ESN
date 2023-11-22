// const socket = io.connect();

let map;
let center;
let selected = {};
let referencePointID;
let directionsService;
let infoWindow;


function initMap() {
    directionsService = new google.maps.DirectionsService;
    // directionsDisplay = new google.maps.DirectionsRenderer;

    navigator.geolocation.getCurrentPosition(function (position) {
        center = {
            lat: position.coords.latitude, lng: position.coords.longitude,
        };

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 12, center: center, mapId: "HAZARD_MAP",
        });

        // directionsDisplay.setMap(map);

        var hazards = window.hazardsData || [];
        console.log(hazards);
        initAutocomplete();
        autoUpdate();
        addMarkers(hazards);

    });

}

function addMarkers(hazards) {
    hazards.forEach(hazard => {
        createMarker(hazard)
    });
}

function createMarker(hazard) {
    const myLatLng = {lat: hazard.latitude, lng: hazard.longitude};
    const marker = new google.maps.Marker({
        position: myLatLng, map, title: hazard.details,
    });

    setHazardName(hazard);
    marker.addListener('click', function () {
        // Create an info window
        referencePointID = hazard._id;
        const localTime = new Date(hazard.createdAt).toLocaleString()
        infoWindow = new google.maps.InfoWindow({
            content: '<strong>' + hazard.name + '</strong><br>' + 'Reported At: ' + localTime + '<br>' + 'Details: ' + hazard.details + '<br>' + '<br><button id="calculate" onclick="calculateDistance()">Calculate Distance</button>' + '<br><button id="mark-as-safe" onclick="removeHazard()">Mark As Safe</button>'
        });

        // Open the info window on marker click
        infoWindow.open(map, marker);
    });

}

function setHazardName(hazard) {
    const reverseGeocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${hazard.latitude},${hazard.longitude}&key=AIzaSyCtSslTFr3ROI5tMdZl1HlnHCPHd_QEjX8`;

    fetch(reverseGeocodeUrl)
        .then(response => response.json())
        .then(data => {
            // Extract location name (formatted address) from the first result
            hazard.name = data.results[0].formatted_address;
        })
        .catch(error => {
            console.error('Error fetching location details:', error);
        });
}

function calculateDistance() {
    const apiUrl = `/hazards/${referencePointID}/`;
    $.ajax({
        url: apiUrl, type: 'GET', dataType: 'json', success: function (data) {
            // Handle the successful response
            console.log('Received data:', data);

            navigator.geolocation.getCurrentPosition(function (position) {
                var origin = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                var destination = new google.maps.LatLng(data.latitude, data.longitude);
                calculateWalkingRoute(origin, destination, data);
            });
        }, error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors
            console.error('Error:', errorThrown);
            $('#result').html('Error: ' + errorThrown);
        }
    });
}


function calculateWalkingRoute(origin, destination, hazard) {
    setHazardName(hazard);
    console.log(hazard);
    directionsService.route({
        origin: origin, destination: destination, travelMode: 'WALKING'  // Specify the travel mode as walking
    }, function (response, status) {
        if (status === 'OK') {
            var route = response.routes[0];
            var distance = route.legs[0].distance.text;
            const localTime = new Date(hazard.createdAt).toLocaleString()
            var updatedContent = '<strong>' + hazard.name + '</strong><br>' + 'Reported At: ' + localTime + '<br>' + 'Details: ' + hazard.details + '<br>' + '<strong>Walking distance: ' + distance + '</strong>' + '<br><button id="mark-as-safe" onclick="removeHazard()">Mark As Safe</>';
            infoWindow.setContent(updatedContent);
            console.log('Walking distance:', distance);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function initAutocomplete() {
    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        const bounds = new google.maps.LatLngBounds();

        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }
            selected.lat = place.geometry.location.lat();
            selected.lng = place.geometry.location.lng();
            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map, icon, title: place.name, position: place.geometry.location,
            }),);
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}

function askConfirmation() {
    // console.log("vbfdjvd");
    $('#confirmReportModal').modal('show');
}

function cancelReporting() {
    $('#addrANDDetails').hide();
    $('#confirmReportModal').modal('hide');
}

function reportHazard() {
    $('#addrANDDetails').show();
    $('#confirmReportModal').modal('hide');
}


function addHazard(lng, lat) {
    $('#addrANDDetails').hide();
    $('#confirmReportModal').modal('hide');
    let details = $('#details').val();
    $.ajax({
        method: 'POST', url: '/hazards/report', data: {
            latitude: selected.lat, longitude: selected.lng, details: details,
        }
    }).done(function (response) {
        response.latitude = parseFloat(response.latitude);
        response.longitude = parseFloat(response.longitude);
        // console.log(response);
        createMarker(response);
        // Clear the input
        $('#pac-input').val('');
        $('#details').val('');
    }).fail(function (error) {
        console.error('Error adding the hazard:', error);
    });
}


function removeHazard() {
    // console.log("grdzarggag");
    $.ajax({
        url: `/hazards/delete/${referencePointID}`, type: 'DELETE', success: function (data) {
            console.log('Hazard deleted successfully:', data);
            //TODO:
            // remove that marker
            //send to the io
        }, error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors
            console.error('Error:', errorThrown);
        }
    });
}


function addElementsBehavior() {
    $('#reportHazard').click(reportHazard);
    $('#addrANDDetails').hide();
    $('#confirmAddress').click(askConfirmation);
    $('.cancelButton').click(cancelReporting);
    $('#confirmReportFinal').click(addHazard);
    $('#calculate').click(calculateDistance);
    $('#mark-as-safe').click(removeHazard);
}


function autoUpdate() {
    let marker;
    navigator.geolocation.getCurrentPosition(function (position) {
        var newPoint = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        if (marker) {
            // Marker already created - Move it
            marker.setPosition(newPoint);
        } else {
            // Marker does not exist - Create it
            marker = new google.maps.Marker({
                position: newPoint, map: map, icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillOpacity: 1,
                    strokeWeight: 2,
                    fillColor: '#5384ED',
                    strokeColor: '#ffffff',
                },
            });
        }
        // Center the map on the new position
        // map.setCenter(newPoint);
    });

    // Call the autoUpdate() function every 5 seconds
    setTimeout(autoUpdate, 5000);
}

$(document).ready(function () {
    initMap();
    addElementsBehavior();
});
