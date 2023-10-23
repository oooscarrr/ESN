// eslint-disable-next-line no-unused-vars
import SpeedTest from "./speedTestController.js";

let postSent = 0;
let postCount = 0;
let getCount = 0;

const MAX_NUM_POST = 1000;
let PublicMessage;
let postCompletionHook = null;
let getCompletionHook = null;

/**
 *
 * @param {SpeedTest} speedtest
 */
export const testSetup = (speedtest) => {
    postCount = 0;
    getCount = 0;
    postSent = 0;
    const dbConnection = speedtest.db_connection;
    PublicMessage = dbConnection.model('PublicMessage');
    postCompletionHook = speedtest.handle_post_completion.bind(speedtest);
    getCompletionHook = speedtest.handle_get_completion.bind(speedtest);
}

export const testTeardown = () => {
    postCount = 0;
    getCount = 0;
    postSent = 0;
    PublicMessage = null;
    postCompletionHook = null;
    getCompletionHook = null;
}

export const test_get_all_public_messages = async (req, res) => {
    try {
        const all_messages = await PublicMessage.find({}).sort({createdAt: 1}).limit(100).exec();
        res.render('publicMessages/list', {messages: all_messages});
        getCount++;
    } catch (error) {
        res.sendStatus(500);
        return console.log('get_all_public_messages Error: ', error);
    }
}

export const test_post_new_public_message = async (req, res) => {
    postSent++;
    if (postSent > MAX_NUM_POST) {
        res.sendStatus(500);
        return postCompletionHook(true);
    }
    try {
        const content = req.body.content;
        const newPubMsg = PublicMessage({senderName: "speedTestUser", content: content});
        await newPubMsg.save();
        postCount++;
        res.status(201).send({'newPublicMessage': newPubMsg});
    } catch (error) {
        res.sendStatus(500);
        return console.log('post_new_message Error: ', error);
    }
}

export const getTestStatistics = () => {
    return {postCount, getCount};
}