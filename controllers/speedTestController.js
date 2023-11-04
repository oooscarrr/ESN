import {app, io} from '../app.js';
import mongoose from 'mongoose';
import {testSetup, testTeardown, getTestStatistics} from './speedTestPublicMessageController.js';
import { publicMessageSchema } from '../models/publicMessage.js';

let speedTest = null;

const SpeedTestState = {
    INSTANTIATED: 'INSTANTIATED',
    INITIALIZED: 'INITIALIZED',
    STARTED: 'STARTED',
    POST_COMPLETED: 'POST_COMPLETED',
    GET_COMPLETED: 'GET_COMPLETED',
    ENDED: 'ENDED',
}
// TODO: add state tracking to allow interruption of speed test
export default class SpeedTest {
    db_url = null;
    db_connection = null;
    initiator = null;
    post_duration = null;
    get_duration = null;
    post_throughput = null;
    get_throughput = null;
    speedtest_socket = null;
    state = null;

    /**
     *
     * @param {*} db_url The URL of the speed test database
     * @param {*} duration The entire duration of the speed test
     * @param {*} initiator The user ID of the user who initiated the speed test
     * @param {*} post_duration the duration of the POST portion of the speed test in milliseconds, default is half of the total duration
     * @param {*} get_duration the duration of the GET portion of the speed test in milliseconds, default is half of the total duration
     */
    constructor(db_url, duration, initiator, post_duration = duration / 2, get_duration = duration / 2) {
        this.db_url = db_url;
        this.duration = duration;
        this.initiator = initiator;
        this.post_duration = post_duration;
        this.get_duration = get_duration;
        this.state = SpeedTestState.INSTANTIATED;
    }

    /**
     * Initializes the speed test: connects to the speed test database, and initializes the socket.io namespace for the speed test.
     * @returns A promise that resolves when the speed test is initialized.
     */
    async initialize() {
        this.db_connection = await this.get_speedtest_db_connection(this.db_url);
        this.speedtest_socket = io;
        this.state = SpeedTestState.INITIALIZED;
    }

    /**
     * Starts the speed test: notify the SpeedTestPublicMessageController to start recording statistics, and then notify the client to start sending messages.
     */
    async startTest() {
        await SpeedTest.suspend_normal_operation(this.initiator);
        testSetup(this);
        this.speedtest_socket.emit('start', this.duration);
        this.state = SpeedTestState.STARTED;
        setTimeout(this.handle_post_completion.bind(this), this.post_duration);
    }

    async handle_post_completion(request_limit_exceeded = false) {
        if(this.state !== SpeedTestState.STARTED){
            return;
        }
        const { postCount } = getTestStatistics();
        this.post_throughput = 1000 * postCount / this.post_duration;
        this.speedtest_socket.emit('/speedtest/completion:post', this.post_throughput, request_limit_exceeded);
        this.state = SpeedTestState.POST_COMPLETED;
        setTimeout(this.handle_get_completion.bind(this), this.get_duration);
    }
    async handle_get_completion() {
        if(this.state !== SpeedTestState.POST_COMPLETED){
            return;
        }
        const { getCount } = getTestStatistics();
        this.get_throughput = 1000 * getCount / this.get_duration;
        this.speedtest_socket.emit('/speedtest/completion:get', this.get_throughput);
        this.state = SpeedTestState.GET_COMPLETED;
        await this.teardown();
    }
    async teardown() {
        await SpeedTest.resume_normal_operation();
        testTeardown();
        if (this.db_connection) {
            await this.clearTestDB(this.db_connection);
            this.db_connection.close();
        }
        this.state = SpeedTestState.ENDED;
        speedTest = null;
    }

    async clearTestDB(db_connection) {
        const PublicMessage = db_connection.model('PublicMessage');
        await PublicMessage.deleteMany({});
    }

    /**
     * Returns a connection to the speed test database. Initializes the PublicMessage model on the connection for use by the SpeedTestPublicMessageController.
     * @param {string} db_url The URL of the speed test database.
     * @returns A mongoose connection to the speed test database.
     */
    async get_speedtest_db_connection(db_url) {
        const test_connection = mongoose.createConnection(
            db_url,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            },
        );
        test_connection.on('error', console.error.bind(console, 'Error: '));
        test_connection.once('open', function () {
            console.log('Speed Test DB Connected successfully!');
        });
        test_connection.model('PublicMessage', publicMessageSchema);
        return test_connection;
    }

    static async suspend_normal_operation(user_id) {
        app.locals.suspended = true;
        app.locals.suspension_initiator = user_id;
        app.locals.under_speed_test = true;
    }

    static async resume_normal_operation() {
        app.locals.suspended = false;
        app.locals.suspension_initiator = null;
        app.locals.under_speed_test = false;
    }
}

export const initialize_speed_test = async (req, res) => {
    console.log('Initializing Speed Test...');
    const { duration } = req.body;
    const initiator = req.userId;

    console.log('duration: ', duration);
    console.log('initiator: ', initiator);
    console.log('process.env.speed_test_db_url: ', process.env.speed_test_db_url);

    speedTest = new SpeedTest(process.env.speed_test_db_url, duration, initiator);
    await speedTest.initialize();
    await speedTest.startTest();

    res.sendStatus(200);
}

export const interrupt_speed_test = async (req, res) => {
    if(speedTest){
        await speedTest.teardown();
        return res.sendStatus(200);
    }
    res.sendStatus(503);
}

export const render_index_page = (req, res) => {
    res.render('speedTest/index');
}