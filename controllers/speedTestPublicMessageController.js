// eslint-disable-next-line no-unused-vars
import SpeedTest from "./speedTestController.js";
// Test Throughput Rule. All POST requests must be completed before the GET requests are issued. Throughput for GET and POST requests are measured separately.
// Test Payload Rule: Each message POST should be 20 characters long.
// Test Duration Tolerance Rule: The actual duration of the performance test should be within 5 seconds of the duration specified by the Administrator.
// Integrity Preservation Rule: Performance tests should not touch, affect, or corrupt  the main database.
//          It should use a test database that is recreated afresh or copied from a backup each time the use case is exercised.
//          The test database should be destroyed when the use case is over.

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
    const dbConnection = speedtest.db_connection;
    PublicMessage = dbConnection.model('PublicMessage');
    postCompletionHook = speedtest.handle_post_completion.bind(speedtest);
    getCompletionHook = speedtest.handle_get_completion.bind(speedtest);
}

export const testTeardown = () => {
    postCount = 0;
    getCount = 0;
    PublicMessage = null;
    postCompletionHook = null;
    getCompletionHook = null;
}

export const test_get_all_public_messages = async (req, res) => {
    try {
        const all_messages = await PublicMessage.find({}).sort({ createdAt: 1 }).limit(100).exec();
        res.render('publicMessages/list', { messages: all_messages });
        getCount++;
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('get_all_public_messages Error: ', error);
    }
}

export const test_post_new_public_message = async (req, res) => {
    // POST Request Limit Rule: The total number of POST requests sent to the system should not exceed a limit of 1000.
    // If the duration of the test is too long, the memory can become full or dangerously low.
    postCount++;
    if(postCount > MAX_NUM_POST){
        res.sendStatus(500);
        return postCompletionHook(true);
    }
    try {
        const content = req.body.content;
        const newPubMsg = PublicMessage({ senderName: "speedTestUser", content: content });
        await newPubMsg.save();
        res.status(201).send({ 'newPublicMessage': newPubMsg });
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('post_new_message Error: ', error);
    }
}

export const getTestStatistics = () => {
    return {postCount, getCount};
}