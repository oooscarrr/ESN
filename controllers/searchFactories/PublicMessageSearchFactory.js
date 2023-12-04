import { AbstractSearchFactory } from './AbstractSearchFactory.js';
import { filterStopWords } from './AbstractSearchFactory.js';
import { app } from '../../app.js';
import { PublicMessage } from '../../models/publicMessage.js';

export default class PublicMessageSearchFactory extends AbstractSearchFactory {
    static getSearchFunction() {
        return PublicMessageSearchFactory.searchMessageByWords;
    }
    static getRenderFunction() {
        return PublicMessageSearchFactory.renderMessages;
    }

    /**
     * @param {Object} criteria Search criteria for public messages
     * @param {string} criteria.query A query string to search
     * @param {string} criteria.pageIndex Index of page, each page has 10 results, if page === 2, returns public message #20 - 29
     * @returns {Array} An array of message objects that match the search criteria
     */
    static searchMessageByWords = async (criteria, pageIndex) => {

        const numberOfResultsToSkip = parseInt(pageIndex) * 10;
        const queryWordsArray = filterStopWords(criteria);

        if (queryWordsArray.length === 0) {
            return [];
        }

        // return await PublicMessage.find({
        //     $and: queryWordsArray.map(word => ({ content: { $regex: new RegExp(word, 'i') } }))
        // })
        // .sort({createdAt: -1 })
        // .skip(numberOfResultsToSkip)
        // .limit(10);

        return await PublicMessage.aggregate([
            {
                $match: {
                    $and: queryWordsArray.map(word => ({ content: { $regex: new RegExp(word, 'i') } }))
                },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'senderName',
                foreignField: 'username',
                as: 'user'
              }
            },
            {
              $unwind: '$user'
            },
            {
              $match: {
                'user.isActive': true
              }
            },
            {
              $sort: { createdAt: -1 }
            }
          ]).skip(numberOfResultsToSkip).limit(10).exec();
    }

    /**
     * @param {Array} publicMessages An array of message objects to be rendered
     * @returns {string} The HTML string of the rendered messages
     */
    static renderMessages = (publicMessages) => {
        // console.log(publicMessages);
        return new Promise((resolve, reject) => {
            app.render('searchResults/publicMessages', {publicMessages: publicMessages}, (err, html) => {
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