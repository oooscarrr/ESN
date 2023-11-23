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
    return hazard;
}

export default setHazardName;