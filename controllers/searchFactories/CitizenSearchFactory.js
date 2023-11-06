import { AbstractSearchFactory } from './AbstractSearchFactory.js';
import { app } from '../../app.js';
import { User } from '../../models/User.js';

export default class CitizenSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return CitizenSearchFactory.searchCitizenBy;
    }
    static getRenderFunction() {
        return CitizenSearchFactory.renderUsers;
    }

    /**
     * @param {Object} criteria The search criteria for searching a citizen
     * @param {string} criteria.usernameFragment The partial or complete username of the target citizen
     * @param {string} criteria.status The status of the target citizen
     * @returns {Array} An array of citizen objects that match the search criteria
     */
    static searchCitizenBy = async (criteria) => {
        if (criteria.usernameFragment) {
            return await CitizenSearchFactory.searchCitizenByUsername(criteria.usernameFragment);
        }
        else if (criteria.status) {
            return await CitizenSearchFactory.searchCitizenByStatus(criteria.status);
        }
        else {
            throw new Error('Invalid search criteria');
        }
    }

    static searchCitizenByUsername = async (usernameFragment) => {
        // If usernameFragment is empty/null or only contaisn whitespaces
        if (!usernameFragment || (typeof usernameFragment === "string" && usernameFragment.trim().length === 0)) {
            return [];
        }
        let queryWordsArray = usernameFragment.toLowerCase().split(" ");
        // Number of words in username query must be one
        if (queryWordsArray.length != 1) {
            return [];
        }
        let username = queryWordsArray[0];
        return await User.find({username: {$regex: new RegExp(username, 'i')}}).sort({isOnline: -1, username: 1});
    }

    static searchCitizenByStatus = async (status) => {
        let userStatus = status.toLowerCase();
        console.log(`Searching for users with status ${userStatus}`)
        return await User.find({lastStatus: userStatus}).sort({isOnline: -1, username: 1});
    }

    /**
     * @param {Array} users An array of citizen objects to be rendered
     * @returns {string} The HTML string of the rendered users
     */
    static renderUsers = (users) => {
        return new Promise((resolve, reject) => {
            app.render('searchResults/users', { users: users }, (err, html) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(html);
                }
            });
        });
    }
}