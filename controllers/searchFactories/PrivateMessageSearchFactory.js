import AbstractSearchFactory from './AbstractSearchFactory.js';
import { app } from '../../app.js';

export default class PrivateMessageSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return PrivateMessageSearchFactory.searchMessageBy;
    }
    static getRenderFunction() {
        return PrivateMessageSearchFactory.renderMessages;
    }

    /**
     * @param {string} criteria The search criteria for searching a message: either a string of words to search for, or the word "status"
     * @returns {Array} An array of message objects that match the search criteria
     */
    static searchMessageBy = async (criteria) => {
        if (criteria === 'status') {
            return await PrivateMessageSearchFactory.searchMessageByStatusChanges();
        }
        else {
            return await PrivateMessageSearchFactory.searchMessageByWords(criteria);
        }
    }

    /**
     * @returns {string} The HTML string of the rendered messages
     */
    static searchMessageByStatusChanges = async () => {
        // TODO: implement me
    }

    /**
     * @param {string} includedWords A string of words that must be included in the message
     * @returns {Array} An array of message objects that match the search criteria
     */
    static searchMessageByWords = async (includedWords) => {
        // TODO: implement me
    }

    /**
     * @param {Array} messages An array of message objects to be rendered
     * @returns {string} The HTML string of the rendered messages
     */
    static renderMessages = (messages) => {
        // TODO: implement me.
    }

    
}