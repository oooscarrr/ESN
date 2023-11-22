import express from 'express';
import authorization from '../middlewares/authorization.js';
import {
    list_new_resource,
    get_resources,
    update_resource,
    delete_resource,
    display_list_item_page,
    get_my_listings,
    display_item_detail
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
router.get('/listitem', display_list_item_page);
router.get('/mylistings', get_my_listings);

export default router;