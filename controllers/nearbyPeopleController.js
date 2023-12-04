import { User } from '../models/User.js';
import { Group } from '../models/Group.js';

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
export function calculate_distance(lat1, lon1, lat2, lon2) {
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
export async function get_nearby_people(userId) {
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
        longitude: { $exists: true, $ne: null },
        isActive: true
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

/**
 * @param {*} nearbyPeople a list of nearby users
 * @returns a list of Groups that nearby users are in
 */
export async function get_nearby_groups(nearbyPeople) {
    if (nearbyPeople.length === 0) {
        return [];
    }

    var nearbyGroupIdsArrays = [];
    for (let i = 0; i < nearbyPeople.length; ++i) {
        nearbyGroupIdsArrays.push(nearbyPeople[i].user.groups);
    }

    // Find the union
    const unionSet = new Set();
    nearbyGroupIdsArrays.forEach((arr) => {
        // Add each element to the Set
        arr.forEach((element) => {
            unionSet.add(element);
        });
    });

    const nearbyGroupIds = Array.from(unionSet);

    // Get the list of Group objects
    let nearbyGroups = []
    for (let i = 0; i < nearbyGroupIds.length; ++i) {
        const id = nearbyGroupIds[i];
        try {
            const group = await Group.findById(id);
            if (group) {
                nearbyGroups.push(group);
            } else {
                continue;
            }
        } catch (error) {
            console.error('get_nearby_groups Error: ', error);
            continue;
        }
    }

    return nearbyGroups;
}


export const list_nearby_people = async (req, res) => {
    const userId = req.userId;
    const nearbyPeople = await get_nearby_people(userId);
    const nearbyGroups = await get_nearby_groups(nearbyPeople);
    
    // console.log("NEARBY GROUPS: ", nearbyGroups);
    // console.log("NEARBY PEOPLE: ", nearbyPeople);

    const nearbyUsers = nearbyPeople.map(({ user }) => ({
        username: user.username,
        userId: user._id.valueOf(),
    }))

    try {
        const currentUser = await User.findById(userId);
        currentUser.nearbyUsers = nearbyUsers;
        await currentUser.save();
    } catch (error) {
        return res.status(500).send(error);
    }

    console.log("nearbyUsers: ", nearbyUsers);
    
    res.render('nearbyPeople/list', {currentUserId: userId, users: nearbyPeople, groups: nearbyGroups});
}