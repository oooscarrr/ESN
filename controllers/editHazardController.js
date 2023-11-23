import {Hazard} from '../models/Hazard.js';
import { io } from '../app.js';

export const display_hazards = async (req, res) => {
    try {
        const allHazards = await Hazard.findAllHazards();
        console.log(allHazards);
        res.render('hazardMap/index', {hazards: allHazards});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


export const add_hazard = async (req, res) => {
    try {
        const {latitude, longitude, details} = req.body;
        if (isValidLatLng(latitude, longitude) == false) {
            console.log(latitude);
            console.log(longitude);
        }
        const newHazard = await Hazard.addHazard(latitude, longitude, details);
        io.emit('newHazard', newHazard);
        // Include the hazard ID in the response
        res.status(201).send({
            id: newHazard._id,
            latitude: latitude,
            longitude: longitude,
            details: details
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

export const isValidLatLng = (latitude, longitude) => {
    // Check if latitude is within the valid range (-90 to +90 degrees)
    const isLatitudeValid = typeof latitude === 'number' && !isNaN(latitude) && latitude >= -90 && latitude <= 90;
    // Check if longitude is within the valid range (-180 to +180 degrees)
    const isLongitudeValid = typeof longitude === 'number' && !isNaN(longitude) && longitude >= -180 && longitude <= 180;
    // Return true if both latitude and longitude are valid, otherwise false
    return isLatitudeValid && isLongitudeValid;
}


export const hazardExists = async (hazardId) => {
    const hazardFound = await Hazard.findHazard(hazardId);
    if (hazardFound && hazardFound._id == hazardId) {
        return true;
    } else {
        return false;
    }
}

export const delete_hazard = async (req, res) => {
    try {
        const hazardId = req.params.id;
        const deletedHazard = await Hazard.deleteHazard(hazardId);
        // await Hazard.deleteAllHazards();
        if (!deletedHazard || deletedHazard.deletedCount == 0) {
            return res.status(404).send('Hazard not found');
        }
        io.emit('removeHazard', deletedHazard);
        res.status(200).json({message: 'Hazard deleted successfully', deletedHazard: deletedHazard});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}
export const get_hazard_byID = async (req, res) => {
    const hazardId = req.params.id;
    const hazard = await Hazard.findHazard(hazardId);
    if (hazard) {
        res.status(200).send(hazard);
    } else {
        res.status(404).send("No such hazard");
    }

}