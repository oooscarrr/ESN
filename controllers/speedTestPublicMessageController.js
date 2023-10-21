import {User} from '../models/User.js';

// Test Throughput Rule. All POST requests must be completed before the GET requests are issued. Throughput for GET and POST requests are measured separately.
// Test Payload Rule: Each message POST should be 20 characters long.
// Test Duration Tolerance Rule: The actual duration of the performance test should be within 5 seconds of the duration specified by the Administrator.
// Integrity Preservation Rule: Performance tests should not touch, affect, or corrupt  the main database.
//          It should use a test database that is recreated afresh or copied from a backup each time the use case is exercised.
//          The test database should be destroyed when the use case is over.

let numPost = 0;
let numGet = 0;

const MAX_NUM_POST = 1000;
let dbConnection;
export const testSetup = (connection) => {
    numPost = 0;
    numGet = 0;
    dbConnection = connection;
}

export const test_get_all_public_messages = async (req, res) => {
    try {
        const msg = await PublicMessage.find().sort({ createdAt: 1 });
        res.status(200).send(msg);
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('get_all_public_messages Error: ', error);
    }
    numGet++;
}

export const test_post_new_public_message = async (req, res) => {
    // POST Request Limit Rule: The total number of POST requests sent to the system should not exceed a limit of 1000.
    // If the duration of the test is too long, the memory can become full or dangerously low.
    if(numPost > MAX_NUM_POST){
        return; //TODO: Do we need to give front end a notice?
    }
    try {
        const userId = req.userId;
        const content = req.body.content;
        const user = await User.findById(userId);
        const publicMsg = dbConnection.model('PublicMessage');
        io.emit('newPublicMessage', publicMsg);
        await publicMsg.save();
        res.status(201).send({ 'newPublicMessage': publicMsg });=
    }
    catch (error) {
        res.sendStatus(500);
        return console.log('post_new_message Error: ', error);
    }
    numPost++;
}

export const getTestStatistics = async (req, res) => {
    return {numPost, numGet};
}