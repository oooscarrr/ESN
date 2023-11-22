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
        res.status(201).send({ 'resourceId': newResource._id });
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
        res.render('resources/item', { item: resource, isOwner: true });
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
        res.render('resources/item', { item: resource, isOwner: resource.owner.toString() === req.userId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

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