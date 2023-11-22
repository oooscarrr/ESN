import { User } from '../models/User.js';
import { Group } from '../models/Group.js';
import { GroupMessage } from '../models/GroupMessage.js';
import { io } from '../app.js';

/**
 * @param {*} groupName
 * @param {*} description 
 * @returns create a new group object and add the groupId to all users in the group
 */
export const create_new_group = async (req, res) => {
    const currentUserId = req.userId;
    const groupName = req.body.groupName;
    const description = req.body.description;
    let nearbyUsers;
    
    const currentUser = await User.findById(currentUserId);
    if (currentUser) {
        nearbyUsers = currentUser.nearbyUsers;
    } else {
        nearbyUsers = [];
    }

    // nearbyUsers stores a list of users that are nearby
    // It's set in nearbyPeopleController.js
    // and refreshed whenever a user opens or refreshes the nearbypeople page
    if (nearbyUsers.length > 0) {
        let groupId;

        // Check if groupName already exists
        const groupChecker = await Group.findOne({groupName: groupName});
        if (groupChecker) {
            return res.status(400).send('Group name already exists');
        }

        // Add current user into nearbyUsers
        const currentUsername = currentUser.username;
        const currentUserObj = {
            username: currentUsername,
            userId: currentUserId,
        };
        nearbyUsers.push(currentUserObj);

        // Create a new group
        try {
            const group = await Group.create({ groupName: groupName, description: description, users: nearbyUsers });
            groupId = group._id.valueOf();
        } catch (error) {
            return res.status(500).send(error);
        } finally {
            console.log('Group Saved Successfully')
        }

        // Add groupId to all nearbyUsers
        for (let i = 0; i < nearbyUsers.length; ++i) {
            const id = nearbyUsers[i].userId;
            const user = await User.findById(id);
            if (!user) {
                console.warn(`User with ID ${id} not found`);
                continue; // Skip to the next iteration
            }
            user.groups.push(groupId);
            await user.save();
        }

        io.emit('newGroup');
        return res.status(201).send({ 'groupId': groupId });
    } else {
        return res.status(400).send('No people nearby, unable to create a new group');
    }
}

/**
 * 
 */
export const list_group_chat_list = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        const groupIds = user.groups;
        let groups = [];

        for (let i = 0; i < groupIds.length; ++i) {
            const group = await Group.findById(groupIds[i]);
            if (group) {
                groups.push(group);
            }
        }

        res.render('groupChat/groupChatList', {groups: groups});
    } catch(error) {
        return res.status(500).send(error);
    }
}

/**
 * @returns a rendered page of a group chat
 */
export const list_group_chat_room = async (req, res) => {
    const userId = req.userId;
    const groupId = req.params.groupId;

    try {
        const groupInfo = await Group.findById(groupId);
        const groupMessages = await GroupMessage.find({groupId: groupId}).sort({createdAt: 1});

        // console.log("GROUP INFO: ", groupInfo);
        // console.log("GROUP MESSAGES: ", groupMessages);

        res.render('groupChat/groupChatroom', {currentUserId: userId, groupInfo: groupInfo, groupMessages: groupMessages});
    } catch (error) {
        return res.status(500).send(error);
    }
}

/**
 * @param {*} groupId 
 * @param {*} res 
 */
export const post_group_message = async (req, res) => {
    let newGroupMessage;
    const senderId = req.userId;
    const groupId = req.body.groupId;
    const content = req.body.input;

    const user = await User.findById(senderId)
    if (!user) {
        return res.status(400).send('User does not exist');
    }
    const senderName = user.username;
    const senderStatus = user.lastStatus;

    try {
        newGroupMessage = await GroupMessage.create({ groupId: groupId, senderId: senderId, senderName: senderName, content: content, senderStatus: senderStatus });
        io.emit('newGroupMessage', newGroupMessage);
    } catch (error) {
        return res.status(500).send(error);
    } finally {
        console.log('Group Message Saved Successfully')
    }

    return res.sendStatus(201);
}

/**
 * 
 * @param {*} groupId group to join
 */
export const join_group = async (req, res) => {
    const userId = req.userId;
    const groupId = req.body.groupId;

    try {
        const user = await User.findById(userId);
        const group = await Group.findById(groupId);

        if (!user || !group) {
            return res.status(400).send('Group or user does not exist');
        }

        user.groups.push(groupId);
        await user.save();

        group.users.push({
            username: user.username,
            userId: userId
        })
        await group.save();

        io.emit('newJoiner', groupId);
    } catch(error) {
        return res.status(500).send(error);
    } finally {
        console.log('User joined group successfully')
    }

    return res.sendStatus(200);
}

/**
 * @param {*} groupId 
 * @param {*} newGroupName 
 */
export const change_group_name = async (req, res) => {
    const groupId = req.body.groupId;
    const newGroupName = req.body.newGroupName;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(400).send('Group does not exist');
        }

        const groupChecker = await Group.findOne({groupName: newGroupName});
        if (groupChecker) {
            return res.status(400).send('Group name alreay taken, try another one');
        }

        group.groupName = newGroupName;
        await group.save();

        io.emit('newGroupName', groupId);
    } catch(error) {
        return res.status(500).send(error);
    } finally {
        console.log('New group name saved successfully')
    }

    return res.sendStatus(200);
}

/**
 * @param {*} groupId 
 * @param {*} newDescription 
 */
 export const change_group_description = async (req, res) => {
    const groupId = req.body.groupId;
    const newDescription = req.body.newDescription;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(400).send('Group does not exist');
        }

        group.description = newDescription;
        await group.save();
    } catch(error) {
        return res.status(500).send(error);
    } finally {
        console.log('New group description saved successfully')
    }

    return res.sendStatus(200);
}

/**
 * @param {*} userId user to remove group from
 * @param {*} groupId group to remove from user
 */
export const remove_group_from_user = async (userId, groupId) => {
    try {
        const user = await User.findById(userId);
        for (let i = 0; i < user.groups.length; ++i) {
            if (user.groups[i] === groupId) {
                user.groups.splice(i, 1);
                await user.save();
                break;
            }
        }
    } catch(error) {
        console.error('remove_group_from_user error:', error.message);
    }
}

/**
 * @param {*} groupId
 */
export const leave_group = async (req, res) => {
    const userId = req.userId;
    const groupId = req.body.groupId;

    try {
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(400).send('Group does not exist');
        }

        // Remove user from the group
        let userFoundInGroup = false;
        for (let i = 0; i < group.users.length; ++i) {
            if (userId === group.users[i].userId) {
                userFoundInGroup = true;
                // If there is only 1 person left after the user leaves the group,
                // delete the group and remove group from all users currently in that group
                if (group.users.length === 2) {
                    for (let j = 0; j < group.users.length; ++j) {
                        const userToRemove = group.users[j].userId;
                        await remove_group_from_user(userToRemove, groupId);
                    }
                    await Group.deleteOne({ _id: groupId });
                    io.emit('deleteGroup', groupId);
                } else {
                    group.users.splice(i, 1);
                    await group.save();
                    io.emit('leaveGroup', groupId);
                }
                break;
            }
        }

        // Remove group from user
        await remove_group_from_user(userId, groupId);

        if (!userFoundInGroup) {
            return res.status(500).send("User not found in group");
        }
    } catch(error) {
        return res.status(500).send(error);
    } finally {
        console.log('Leave group successfully')
    }

    return res.sendStatus(200);
}
