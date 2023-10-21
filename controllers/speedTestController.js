import {app, io} from '../app.js';
import mongoose from 'mongoose';
// import speedTestPublicMessageController from './speedTestPublicMessageController.js';
import { publicMessageSchema } from '../models/publicMessage.js';

// class SpeedTest {
//     db_url = null;
//     db_connection = null;
//     initiator = null;
//     post_duration = null;
//     get_duration = null;
//     post_throughput = null;
//     get_throughput = null;
//     speedtest_socket = null;

//     constructor(db_url, duration, initiator, post_duration = duration / 2, get_duration = duration / 2) {
//         this.db_url = db_url;
//         this.duration = duration;
//         this.initiator = initiator;
//         this.post_duration = post_duration;
//         this.get_duration = get_duration;
//     }

//     async initialize() {
//         this.db_connection = await this.get_speedtest_db_connection(this.db_username, this.db_password, this.db_address);
//         this.speedtest_socket = io.of('/speedtest');
//     }

//     /**
//      * Starts the speed test: notify the SpeedTestPublicMessageController to start recording statistics, and then notify the client to start sending messages.
//      */
//     async startTest() {
//         await SpeedTest.suspend_normal_operation(this.initiator);
//         speedTestPublicMessageController.setup(this.db_connection);
//         setTimeout(this.handle_post_completion, this.post_duration);
//     }

//     async handle_post_completion() {
//         const { post } = speedTestPublicMessageController.get_statistics();
//         this.post_throughput = post / this.post_duration;
//         speedtest_socket.emit('completion:post'.this.post_throughput);
//         setTimeout(this.handle_get_completion, this.get_duration);
//     }
//     async handle_get_completion() {
//         const { get } = speedTestPublicMessageController.get_statistics();
//         this.get_throughput = get / this.get_duration;
//         speedtest_socket.emit('completion:get'.this.get_throughput);
//         await SpeedTest.resume_normal_operation();
//     }


//     async get_speedtest_db_connection(username, password, dbAddress) {
//         const test_connection = mongoose.createConnection(
//             `mongodb+srv://${username}:${password}@${dbAddress}/?retryWrites=true&w=majority`,
//             {
//                 useNewUrlParser: true,
//                 useUnifiedTopology: true,
//             },
//         );
//         test_connection.on('error', console.error.bind(console, 'Error: '));
//         test_connection.once('open', function () {
//             console.log('Speed Test DB Connected successfully!');
//         });
//         test_connection.model('PublicMessage', publicMessageSchema);
//         return test_connection;
//     }

//     static async suspend_normal_operation(user_id) {
//         app.locals.suspended = true;
//         app.locals.suspension_initiator = user_id;
//     }

//     static async resume_normal_operation() {
//         app.locals.suspended = false;
//         app.locals.suspension_initiator = null;
//     }
// }

// export const initialize_speed_test = async (req, res) => {
//     const { duration } = req.body;
//     const initiator = req.user_id;
//     const speedTest = new SpeedTest(process.env.speed_test_db_url, duration, initiator);
//     await speedTest.initialize();

//     res.sendStatus(200);
// }

export const render_index_page = (req, res) => {
    res.render('speedtest/index');
}