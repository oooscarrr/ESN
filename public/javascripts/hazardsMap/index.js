// const socket = io.connect();
let map;
let center;

function initMap() {
    navigator.geolocation.getCurrentPosition(function (position) {
        center = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };

        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: center,
            mapId: "HAZARD_MAP",
        });
        console.log(map);
        const input = document.getElementById("pac-input");
        const searchBox = new google.maps.places.SearchBox(input);
        console.log(map);
        initAutocomplete();

        let marker;
        function autoUpdate() {
            navigator.geolocation.getCurrentPosition(function (position) {
                var newPoint = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);
                if (marker) {
                    // Marker already created - Move it
                    marker.setPosition(newPoint);
                } else {
                    // Marker does not exist - Create it
                    marker = new google.maps.Marker({
                        position: newPoint,
                        map: map,
                        icon: {
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

        autoUpdate();
    });


}


function initAutocomplete() {
    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);

    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
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

            const icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25),
            };

            // Create a marker for each place.
            markers.push(
                new google.maps.Marker({
                    map,
                    icon,
                    title: place.name,
                    position: place.geometry.location,
                }),
            );
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

$(document).ready(function () {
    // initMap();
    addElementsBehavior();
});
