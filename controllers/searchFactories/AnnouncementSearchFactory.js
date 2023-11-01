import AbstractSearchFactory from './AbstractSearchFactory.js';
import { app } from '../../app.js';

export default class AnnouncementSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return AnnouncementSearchFactory.searchByWords;
    }
    static getRenderFunction() {
        return AnnouncementSearchFactory.renderAnnouncements;
    }

    /**
     * @param {string} includedWords The words that must be included in the announcement
     * @returns {Array} An array of announcement objects that match the search criteria
     */
    static searchByWords = async (includedWords) => {
        // TODO: implement me
    }

    /**
     * @param {Array} announcements An array of announcement objects to be rendered
     * @returns {string} The HTML string of the rendered announcements
     */
    static renderAnnouncements = (announcements) => {
        // TODO: implement me. I'm thinking something like:
        // return app.render('search/results/announcements', {announcements: announcements});
        // which will be res.send()ed by the controller
    }
}