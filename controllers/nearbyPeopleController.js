import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { io } from '../app.js';

/**
 * A helper function for calculate_distance
 */
function deg2rad(deg) {
    return deg * (Math.PI/180)
}

/**
 * @param {Number} lat1 latitude of user 1
 * @param {Number} lon1 longitude of user 1
 * @param {Number} lat2 latitude of user 2
 * @param {Number} lon2 longitude of user 2
 * @returns {Number} distance (in meters) between user 1 and user 2
 */
function calculate_distance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2-lat1);  // deg2rad above
    const dLon = deg2rad(lon2-lon1); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c * 1000; // Distance in meters
    return d;
}

/**
 * @param {String} userId id of the user that we are searching nearby people for
 * @returns {List} a list of nearby users ranked by their distance to the user (online first)
 */
async function get_nearby_people(userId) {
    const user = await User.findById(userId);
    const lat = user ? user.latitude : null;
    const lon = user ? user.longitude : null;
    const maxDistance = 300;

    // If current user does not have a latitude or longitude in DB
    if (!lat || !lon) {
        return [];
    }

    // Get all users with latitude and longitude
    const usersWithLocation = await User.find({
        username: { $ne: user.username }, // Exclude the current user by username
        latitude: { $exists: true, $ne: null },
        longitude: { $exists: true, $ne: null }
    });

    // Calculate distances for each user and filter by maxDistance
    const usersWithDistances = usersWithLocation
        .map(user => ({
            user,
            distance: calculate_distance(user.latitude, user.longitude, lat, lon)
        }))
        .filter(userWithDistance => userWithDistance.distance <= maxDistance);

    // Sort users by isOnline and distance
    const sortedUsers = usersWithDistances.sort((a, b) => {
        if (a.user.isOnline && !b.user.isOnline) {
            return -1; // Online users come first
        } else if (!a.user.isOnline && b.user.isOnline) {
            return 1; // Offline users come later
        } else {
            // Sort by distance if isOnline status is the same
            return a.distance - b.distance;
        }
    });

    return sortedUsers
}


export const list_nearby_people = async (req, res) => {
    const userId = req.userId;
    const nearbyPeople = await get_nearby_people(userId);
    
    res.render('nearbyPeople/list', {users: nearbyPeople});

    console.log("NEARBY: ", nearbyPeople);
}