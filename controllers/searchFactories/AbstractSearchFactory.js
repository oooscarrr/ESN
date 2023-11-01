export default class AbstractSearchFactory {
    static getSearchFunction(){
        throw new Error('Abstract method not implemented');
    }
    static getRenderFunction(){
        throw new Error('Abstract method not implemented');
    }
}