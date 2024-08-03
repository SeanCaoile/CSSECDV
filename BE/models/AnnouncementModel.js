import db from '../config/database.js';
import { logOperation } from '../utils/logger.js'; // Import the logging function

const validate500Char = (announcement) => /^.{0,500}$/.test(announcement);

// Get the very last announcement
export const getLastAnnouncement = (result) => {
    db.query("SELECT * FROM `announcements` ORDER BY id DESC LIMIT 1", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res[0]);
    });
};

// Create a new announcement
// Note: IP has to be given
export const createAnnouncement = (newAnnouncement, ip, result) => {
    
    if (!validate500Char(newAnnouncement)) { 
        if(debug===1){
            return res.status(400).send(error);
        } else {
            return res.status(400).send({ error: 'An error occurred while creating the announcement' });
        }
    }  

    const { content, email } = newAnnouncement;
    db.query("INSERT INTO `announcements` (content) VALUES (?)", [content], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        const createdAnnouncement = { id: res.insertId, ...newAnnouncement };
        logOperation('createAnnouncement', ip, createdAnnouncement);
        result(null, createdAnnouncement);
    });
};
