import { AbstractSearchFactory, filterStopWords } from './AbstractSearchFactory.js';
import { app } from '../../app.js';
import { Announcement } from '../../models/Announcement.js';

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
    static searchByWords = async (criteria, pageIndex) => {
        const numberOfResultsToSkip = parseInt(pageIndex) * 10;
        const queryWordsArray = filterStopWords(criteria);

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
        console.log(announcements);
        return new Promise((resolve, reject) => {
            app.render('searchResults/announcements', {announcements: announcements}, (err, html) => {
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