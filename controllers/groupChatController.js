import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { GroupMessage } from '../models/GroupMessage.js';
import { io } from '../app.js';

/**
 * 
 * @param {*} groupName
 * @param {*} description 
 * @returns create a new group object and add the groupId to all users in the group
 */
export const create_new_group = async (req, res) => {
    // app.locals.nearbyPeople stores a list of users that are nearby
    // It's set in nearbyPeopleController.js
    // and refreshed whenever a user opens or refreshes the nearbypeople page
    if (req.app.locals.nearbyPeople) {
        let groupId;
        const groupName = req.body.groupName;
        const description = req.body.description;
        const users = req.app.locals.nearbyPeople.map(({ user }) => ({
            username: user.username,
            userId: user._id.valueOf(),
        }))

        // Add current user into users
        const currentUserId = req.userId;
        const currentUser = await User.findById(currentUserId);
        const currentUsername = currentUser.username;
        const currentUserObj = {
            username: currentUsername,
            userId: currentUserId,
        };
        users.push(currentUserObj);

        // Create a new group
        try {
            const group = await Group.create({ groupName: groupName, description: description, users: users });
            groupId = group._id.valueOf();
        } catch (error) {
            res.sendStatus(500);
            return console.log('create_new_group Error: ', error);
        } finally {
            console.log('Group Saved Successfully')
        }

        // Add groupId to all users
        for (let i = 0; i < users.length; ++i) {
            const id = users[i].userId;
            const user = await User.findById(id);
            if (!user) {
                console.warn(`User with ID ${id} not found`);
                continue; // Skip to the next iteration
            }
            user.groups.push(groupId);
            await user.save();
        }
        
        return res.status(200).send({ 'groupId': groupId });
    } else {
        res.sendStatus(500);
        console.log('No people nearby, unable to create a new group');
    }
}
