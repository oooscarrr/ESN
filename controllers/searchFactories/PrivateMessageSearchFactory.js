import { AbstractSearchFactory } from './AbstractSearchFactory.js';
import { filterStopWords } from './AbstractSearchFactory.js';
import { app } from '../../app.js';
import { PrivateMessage } from '../../models/privateMessage.js';

export default class PrivateMessageSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return PrivateMessageSearchFactory.searchMessages;
    }
    static getRenderFunction() {
        return PrivateMessageSearchFactory.renderMessages;
    }

    static searchMessages = async (criteria, pageIndex) => {
        if (criteria.status) {
            return await this.searchMessageByStatusChange(criteria, pageIndex);
        } else if (criteria.query) {
            return await this.searchMessageByWords(criteria, pageIndex)
        } else {
            throw new Error('Invalid search criteria');
        }

    }

    static searchMessageByStatusChange = async (criteria, pageIndex) => {
        // console.log(criteria);

        const myUserId = criteria.myUserId;
        const otherUserId = criteria.otherUserId;
        const numberOfChangesToDisplay = 10;

        const allMessages = await PrivateMessage.find({
            senderId: otherUserId, 
            receiverId: myUserId
        })
        .sort({createdAt: -1 })

        let statusChangeMessages = [];
        for (let i = 0; i < allMessages.length-1; i++) {
            if (allMessages[i].senderStatus !== allMessages[i + 1]?.senderStatus) {
                statusChangeMessages.push(allMessages[i]);
            }
            if (statusChangeMessages.length >= numberOfChangesToDisplay) {
                break;
            }
        }

        return statusChangeMessages;

    }

    /**
     * @param {Object} criteria Search criteria for private messages
     * @param {string} criteria.myUserId UserId of the current user in this private chatroom
     * @param {string} criteria.otherUserId UserId of the other user in this private chatroom
     * @param {string} criteria.query A query string to search
     * @param {string} criteria.pageIndex Index of page, each page has 10 results, if page === 2, returns private message #20 - 29
     * @returns {Array} An array of message objects that match the search criteria
     */
    static searchMessageByWords = async (criteria, pageIndex) => {
        const myUserId = criteria.myUserId;
        const otherUserId = criteria.otherUserId;
        const numberOfResultsToSkip = parseInt(pageIndex) * 10;
        const query = criteria.query;
        const queryWordsArray = filterStopWords(query);

        if (queryWordsArray.length === 0) {
            return [];
        }

        return await PrivateMessage.find({
            $or: [{senderId: myUserId, receiverId: otherUserId}, {senderId: otherUserId, receiverId: myUserId}],
            $and: queryWordsArray.map(word => ({ content: { $regex: new RegExp(word, 'i') } }))
        })
        .sort({createdAt: -1 })
        .skip(numberOfResultsToSkip)
        .limit(10);
    }

    /**
     * @param {Array} privateMessages An array of message objects to be rendered
     * @returns {string} The HTML string of the rendered messages
     */
    static renderMessages = (privateMessages) => {
        // console.log(privateMessages);
        return new Promise((resolve, reject) => {
            app.render('searchResults/privateMessages', {privateMessages: privateMessages}, (err, html) => {
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