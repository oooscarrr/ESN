import * as RegularPMC from './publicMessageController.js';
import * as SpeedTestPMC from './speedTestPublicMessageController.js';
import {app} from '../app.js';

export const post_new_public_message = async (req, res) => {
    if (app.locals.under_speed_test) {
        await SpeedTestPMC.test_post_new_public_message(req, res);
    }
    else {
        await RegularPMC.post_new_public_message(req, res);
    }
}

export const list_public_messages = async (req, res) => {
    if (app.locals.under_speed_test) {
        await SpeedTestPMC.test_get_all_public_messages(req, res);
    }
    else {
        await RegularPMC.list_public_messages(req, res);
    }
}