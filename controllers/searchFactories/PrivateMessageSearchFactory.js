import AbstractSearchFactory from './AbstractSearchFactory.js';
import { filterStopWords } from './AbstractSearchFactory.js';
import { app } from '../../app.js';
import { PrivateMessage } from '../../models/privateMessage.js';

export default class PrivateMessageSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return PrivateMessageSearchFactory.searchMessageByWords;
    }
    static getRenderFunction() {
        return PrivateMessageSearchFactory.renderMessages;
    }

    /**
     * @param {Object} criteria Search criteria for private messages
     * @param {string} criteria.userIdOne UserId of private message sender or receiver
     * @param {string} criteria.userIdTwo UserId of private message receiver or sender
     * @param {string} criteria.query A query string to search
     * @param {string} criteria.pageIndex Index of page, each page has 10 results, if page === 2, returns private message #20 - 29
     * @returns {Array} An array of message objects that match the search criteria
     */
    static searchMessageByWords = async (criteria) => {
        const userIdOne = criteria.userIdOne;
        const userIdTwo = criteria.userIdTwo;
        const pageIndex = criteria.pageIndex;
        const numberOfResultsToSkip = parseInt(pageIndex) * 10;
        const query = criteria.query;
        const queryWordsArray = filterStopWords(query);

        if (queryWordsArray.length === 0) {
            return [];
        }

        return await PrivateMessage.find({
            $or: [{senderId: userIdOne, receiverId: userIdTwo}, {senderId: userIdTwo, receiverId: userIdOne}],
            $and: queryWordsArray.map(word => ({ content: { $regex: new RegExp(word, 'i') } }))
        })
        .sort({createdAt: -1 })
        .skip(numberOfResultsToSkip)
        .limit(10);
    }

    /**
     * @param {Array} messages An array of message objects to be rendered
     * @returns {string} The HTML string of the rendered messages
     */
    static renderMessages = (messages) => {
        return app.render('searchResults/privateMessages', {messages: messages});
        // TODO: implement searchResults/privateMessages.pug
    }
}