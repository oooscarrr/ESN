import express from 'express';
import authorization from '../middlewares/authorization.js';
import {
    list_new_resource,
    get_resources,
    update_resource,
    delete_resource,
    display_list_item_page,
    get_my_listings,
    display_item_detail,
    accept_request,
    reject_request,
    send_request,
    // edit_request,
    delete_request,
    get_my_requests
} from '../controllers/resourceController.js';
import multer from 'multer';

const upload = multer();
const router = express.Router();

router.use(authorization);
router.post('/', upload.single('image'), list_new_resource);
router.get('/', get_resources);
router.get('/item/:resourceId', display_item_detail);
router.put('/:resourceId', upload.single('image'), update_resource);
router.delete('/:resourceId', delete_resource);
router.get('/newitem', display_list_item_page);
router.get('/mylistings', get_my_listings);

router.put('/acceptance/:requestId', accept_request);
router.put('/rejection/:requestId', reject_request);
router.post('/newrequest', send_request);
// router.put('/editrequest/:requestId', edit_request);
router.delete('/requestdeletion/:resourceId', delete_request);
router.get('/myrequests', get_my_requests);

export default router;