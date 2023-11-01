import AbstractSearchFactory from './AbstractSearchFactory.js';
import { app } from '../../app.js';

export default class PublicMessageSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return PublicMessageSearchFactory.searchMessageByWords;
    }
    static getRenderFunction() {
        return PublicMessageSearchFactory.renderMessages;
    }

    /**
     * @param {string} includedWords The words that must be included in the message
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