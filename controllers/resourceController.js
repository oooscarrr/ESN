import { Resource } from '../models/Resource.js';
import { ResourceRequest } from '../models/ResourceRequest.js';
import { User } from '../models/User.js';
import sharp from 'sharp';
import s3 from '../config/s3-config.js';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

/*
This function posts a resource from a user
- Input:
    userId (str)
    name (str)
    description (str)
    quantity (int)
    image (file)
- Output:
    status code, new resource
*/
export const list_new_resource = async (req, res) => {
    const file = req.file;
    try {
        let imageURL;
        if (file) {
            imageURL = await upload_image_to_s3(file);
        }
        const owner = await User.findById(req.userId);
        const newResource = new Resource({
            name: req.body.name,
            description: req.body.description || '',
            quantity: req.body.quantity || 1,
            owner: req.userId,
            ownerName: owner.username,
            imageURL: imageURL,
        });
        await newResource.save();
        res.status(201).json({ 'resourceId': newResource._id });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

/*
This function updates a resource's information
- Input:
    resourceId (str)
    name (str)
    description (str)
    quantity (int)
    image (file)
- Output:
    status code, updated resource
*/
export const update_resource = async (req, res) => {
    const file = req.file;
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        if (resource.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (file) {
            if (resource.imageURL) {
                await delete_image_from_s3(resource.imageURL);
            }
            resource.imageURL = await upload_image_to_s3(file);
        }
        resource.name = req.body.name;
        resource.description = req.body.description;
        resource.quantity = req.body.quantity;
        resource.updatedAt = Date.now();
        await resource.save();
        res.status(200).json({ message: 'Resource updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/*
This function deletes a resource
- Input:
    resourceId (str)
- Output:
    status code
*/
export const delete_resource = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        if (resource.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        if (resource.imageURL) {
            await delete_image_from_s3(resource.imageURL);
        }
        await ResourceRequest.deleteMany({ resource: req.params.resourceId });
        await Resource.deleteOne({ _id: req.params.resourceId });
        res.status(200).json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/*
This function uploads an image to S3
- Input:
    buffer (buffer)
    filename (str)
- Output:
    the image's S3 URL
*/
const upload_image_to_s3 = async (file) => {
    const buffer = await sharp(file.buffer).resize({ width: 1000, height: 1000 }).png().toBuffer();
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `/resources/${file.originalname}`,
        Body: buffer,
        ContentType: 'image/png',
    };
    const command = new PutObjectCommand(params);
    await s3.send(command);
    return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(params.Key)}`;
};

/*
This function deletes an image from S3
- Input:
    imageURL (str)
- Output:
    S3 data
*/
const delete_image_from_s3 = async (imageURL) => {
    const key = decodeURIComponent(imageURL.split('/').pop());
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    };
    const command = new DeleteObjectCommand(params);
    return await s3.send(command);
};

/*
This function searches resources by keyword or gets all resources if no keyword is provided, then renders the page
- Input:
    optional keyword (str)
- Output:
    An array of resources
*/
export const get_resources = async (req, res) => {
    try {
        let query = {};
        if (req.query.keyword) {
            const rgx = new RegExp(req.query.keyword, 'i');
            query = {
                $or: [
                    { name: { $regex: rgx } },
                    { description: { $regex: rgx } }
                ]
            }
        }
        const result = await Resource.find(query).sort({ updatedAt: -1 });
        result.forEach(resource => {
            resource.timeSinceLastUpdate = timeSince(resource.updatedAt);
        });
        res.render('resources/board', { resources: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/*
This function renders the list item page
- Input:
    N/A
- Output:
    N/A
*/
export const display_list_item_page = async (req, res) => {
    res.render('resources/listItem');
};

/*
This function gets all resources posted by the user
- Input:
    N/A
- Output:
    An array of resources
*/
export const get_my_listings = async (req, res) => {
    try {
        const result = await Resource.find({ owner: req.userId }).sort({ updatedAt: -1 });
        result.forEach(resource => {
            resource.timeSinceLastUpdate = timeSince(resource.updatedAt);
        });
        res.render('resources/myListings', { myListings: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/*
This function gets a resource by its ID
- Input:
    resourceId (str)
- Output:
    A resource detail page rendered
*/
export const display_item_detail = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        resource.timeSinceLastUpdate = timeSince(resource.updatedAt);
        const isOwner = resource.owner.toString() === req.userId;
        let requests = await ResourceRequest.find({ resource: req.params.resourceId }).sort({ updatedAt: -1 });
        let requested = false;
        if (isOwner) {
            requests.forEach(request => {
                request.timeSinceLastUpdate = timeSince(request.updatedAt);
            });
        } else {
            for (let request of requests) {
                if (request.requester.toString() === req.userId) {
                    requested = true;
                    break;
                }
            }
        }
        requests = requests.filter(request => request.status === 'pending');
        res.render('resources/item', { item: resource, isOwner: isOwner, requests: isOwner ? requests : null, requested: requested });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const accept_request = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const request = await ResourceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        const resource = await Resource.findById(request.resource);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        if (resource.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        resource.quantity -= request.quantity;
        await resource.save();
        request.status = 'accepted';
        request.updatedAt = Date.now();
        await request.save();
        res.status(200).json({ message: 'Request accepted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const reject_request = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const request = await ResourceRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        const resource = await Resource.findById(request.resource);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        if (resource.owner.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        request.status = 'rejected';
        request.updatedAt = Date.now();
        await request.save();
        res.status(200).json({ message: 'Request rejected' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const send_request = async (req, res) => {
    try {
        console.log(req.body);
        const requester = await User.findById(req.userId);
        const resource = await Resource.findById(req.body.resourceId);
        console.log('im here');
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        const newRequest = new ResourceRequest({
            resource: req.body.resourceId,
            requester: req.userId,
            requesterName: requester.username,
            quantity: req.body.quantity || 1,
            message: req.body.message || '',
        });
        await newRequest.save();
        resource.requests.push(newRequest._id);
        resource.updatedAt = Date.now();
        await resource.save();
        res.status(201).json({ requestId: newRequest._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// export const edit_request = async (req, res) => {

// };

export const delete_request = async (req, res) => {
    try {
        const resource = await Resource.findById(req.params.resourceId);
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        const request = await ResourceRequest.findOne({ resource: req.params.resourceId, requester: req.userId });
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        await ResourceRequest.deleteOne({ _id: request._id });
        const index = resource.requests.indexOf(request._id);
        resource.requests.splice(index, 1);
        await resource.save();
        res.status(200).json({ message: 'Request deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const get_my_requests = async (req, res) => {
    try {
        const result = await ResourceRequest.find({ requester: req.userId }).sort({ updatedAt: -1 });
        for (let request of result) {
            request.timeSinceRequest = timeSince(request.updatedAt);
            const resource = await Resource.findById(request.resource);
            request.itemName = resource.name;
        }
        res.render('resources/myRequests', { myRequests: result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/*
This function calculates the time interval between a date and now
- Input:
    date (date)
- Output:
    A string describing the time interval
*/
const timeSince = (date) => {
    const seconds = Math.floor((new Date()-new Date(date))/1000);
    let interval = seconds/31536000;
    if (interval > 1) {
        if (interval > 2) return Math.floor(interval)+" years ago";
        return "1 year ago";
    }
    interval = seconds/2592000;
    if (interval > 1) {
        if (interval > 2) return Math.floor(interval)+" months ago";
        return "1 month ago";
    }
    interval = seconds/86400;
    if (interval > 1) {
        if (interval > 2) return Math.floor(interval)+" days ago";
        return "1 day ago";
    }
    interval = seconds/3600;
    if (interval > 1) {
        if (interval > 2) return Math.floor(interval)+" hours ago";
        return "1 hour ago";
    }
    interval = seconds/60;
    if (interval > 1) {
        if (interval > 2) return Math.floor(interval)+" minutes ago";
        return "1 minute ago";
    }
    return Math.floor(seconds)+" seconds ago";
};