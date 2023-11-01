import AnnouncementSearchFactory from "./searchFactories/AnnouncementSearchFactory";
import CitizenSearchFactory from "./searchFactories/CitizenSearchFactory";
import PrivateMessageSearchFactory from "./searchFactories/PrivateMessageSearchFactory";
import PublicMessageSearchFactory from "./searchFactories/PublicMessageSearchFactory";

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

export default executeSearch = async (req, res) => {
    const {context, criteria} = req.body;
    const searchFactory = getSearchFactory(context);
    const search = searchFactory.getSearchFunction();
    const render = searchFactory.getRenderFunction();
    const results = await search(criteria);
    const renderedResults = render(results);
    res.send(renderedResults).status(200);
}