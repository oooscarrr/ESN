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

        // Check if groupName already exists
        const groupChecker = await Group.findOne({groupName: groupName});
        if (groupChecker) {
            return res.status(400).send('Group name already exists');
        }

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
            return res.status(500).send(error);
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

        io.emit('newGroup');
        return res.status(200).send({ 'groupId': groupId });
    } else {
        res.sendStatus(500);
        console.log('No people nearby, unable to create a new group');
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
        res.status(500).send(error);
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
        res.status(500).send(error);
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
    } catch (error) {
        return res.status(500).send(error);
    } finally {
        console.log('Group Message Saved Successfully')
    }

    io.emit('newGroupMessage', newGroupMessage);
    return res.sendStatus(201);
}

/**
 * 
 * @param {*} groupId group to join
 */
export const joinGroup = async (req, res) => {
    const userId = req.userId;
    const groupId = req.body.groupId;

    try {
        const user = await User.findById(userId);
        const group = await Group.findById(groupId);

        if (!user || !group) {
            res.status(400).send('Group or user does not exist');
        }

        user.groups.push(groupId);
        await user.save();

        group.users.push({
            username: user.username,
            userId: userId
        })
        await group.save();
    } catch(error) {
        return res.status(500).send(error);
    } finally {
        console.log('User joined group successfully')
    }

    io.emit('newJoiner', groupId);
    return res.sendStatus(200);
}
