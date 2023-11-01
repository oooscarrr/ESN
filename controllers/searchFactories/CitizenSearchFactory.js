import AbstractSearchFactory from './AbstractSearchFactory.js';
import { app } from '../../app.js';

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
        // TODO: implement me
    }

    static searchCitizenByStatus = async (status) => {
        // TODO: implement me
    }

    /**
     * @param {Array} users An array of citizen objects to be rendered
     * @returns {string} The HTML string of the rendered users
     */
    static renderUsers = (users) => {
        // TODO: implement me. I'm thinking something like:
        // return app.render('search/results/users', {users: users});
        // which will be res.send()ed by the controller
    }
}