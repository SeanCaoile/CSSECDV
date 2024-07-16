import db from '../config/database.js';
import { logOperation } from '../utils/logger.js'; // Import the logging function

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
