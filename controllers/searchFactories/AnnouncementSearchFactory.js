import AbstractSearchFactory from './AbstractSearchFactory.js';
import { filterStopWords } from './AbstractSearchFactory.js';
import { app } from '../../app.js';
import { Announcement } from '../../models/Announcement';

export default class AnnouncementSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return AnnouncementSearchFactory.searchByWords;
    }
    static getRenderFunction() {
        return AnnouncementSearchFactory.renderAnnouncements;
    }

    /**
     * @param {Object} criteria Search criteria for public announcements
     * @param {string} criteria.query A query string to search
     * @param {string} criteria.pageIndex Index of page, each page has 10 results, if page === 2, returns public message #20 - 29
     * @returns {Array} An array of announcement objects that match the search criteria
     */
    static searchByWords = async (criteria) => {
        const pageIndex = criteria.pageIndex;
        const numberOfResultsToSkip = parseInt(pageIndex) * 10;
        const query = criteria.query;
        const queryWordsArray = filterStopWords(query);

        if (queryWordsArray.length === 0) {
            return [];
        }

        return await Announcement.find({
            $and: queryWordsArray.map(word => ({ content: { $regex: new RegExp(word, 'i') } }))
        })
        .sort({createdAt: -1 })
        .skip(numberOfResultsToSkip)
        .limit(10);
    }

    /**
     * @param {Array} announcements An array of announcement objects to be rendered
     * @returns {string} The HTML string of the rendered announcements
     */
    static renderAnnouncements = (announcements) => {
        return app.render('searchResults/announcements', {announcements: announcements});
        // TODO: implement views/searchResults/announcements.pug
    }
}