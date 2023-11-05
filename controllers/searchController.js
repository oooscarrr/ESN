import AnnouncementSearchFactory from "./searchFactories/AnnouncementSearchFactory.js";
import CitizenSearchFactory from "./searchFactories/CitizenSearchFactory.js";
import PrivateMessageSearchFactory from "./searchFactories/PrivateMessageSearchFactory.js";
import PublicMessageSearchFactory from "./searchFactories/PublicMessageSearchFactory.js";

const getSearchFactory = (context) => {
    switch (context) {
        case 'announcements':
            return AnnouncementSearchFactory;
        case 'citizens':
            return CitizenSearchFactory;
        case 'privateMessages':
            return PrivateMessageSearchFactory;
        case 'publicMessages':
            return PublicMessageSearchFactory;
        default:
            throw new Error('Invalid search context');
    }
}

export default async function executeSearch(req, res) {
    const {context, criteria} = req.query;
    const searchFactory = getSearchFactory(context);
    const search = searchFactory.getSearchFunction();
    const render = searchFactory.getRenderFunction();
    const results = await search(criteria);
    const renderedResults = render(results);
    res.status(200).send(renderedResults);
}