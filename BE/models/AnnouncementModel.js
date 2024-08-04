import db from '../config/database.js';
import { logOperation } from '../utils/logger.js'; // Import the logging function
const debug = process.env.DEBUG;

//const validate500Char = (announcement) => /^.{0,500}$/.test(announcement);

const validateContent = (content) => /^[\w\s.,!?"'()@#%&*+-/=:;]{1,500}$/.test(content);

// Validate expirationTime to be a positive integer
const validateExpirationTime = (time) => /^\d+$/.test(time);

// Get the very last announcement
export const getLastAnnouncement = (result) => {
    db.query("SELECT * FROM `announcements` ORDER BY id DESC LIMIT 1", (err, res) => {
        if (err) {
            if (debug == '1') {
                console.log("error: ", err);
                result(err, null);
            }
            result("Error occurred", null);
            return;
        }
        result(null, res[0]);
    });
};

// Create a new announcement
// Note: IP has to be given
export const createAnnouncement = (newAnnouncement, ip, result) => {
    
    if (!validateContent(newAnnouncement.content) || !validateExpirationTime(newAnnouncement.expirationTime)) { 
        if (debug == '1') {
            return res.status(400).send(error);
        } else {
            return res.status(400).send({ error: 'An error occurred while creating the announcement' });
        }
    }

    const { content, expirationTime } = newAnnouncement;
    //console.log("Expiration time is " + expirationTime)
    const expireAt = new Date(Date.now() + expirationTime * 60000); // Calculate expiration time

    if (isNaN(expireAt.getTime())) {
        console.log("Invalid expiration date");
        result("Invalid expiration date", null);
        return;
    }

    const formattedExpireAt = expireAt.toISOString().slice(0, 19).replace('T', ' '); // Format to 'YYYY-MM-DD HH:MM:SS'
    console.log("Expire at is " + formattedExpireAt);

    db.query("INSERT INTO `announcements` (content, isExpired, expireAt) VALUES (?, 0, ?)", 
    [content, formattedExpireAt], 
    (err, res) => {
        if (err) {
            if (debug == '1') {
                console.log("error: ", err);
                result(err, null);
            }
            result("Error occurred", null);
            return;
        }
        const createdAnnouncement = { id: res.insertId, content, expireAt: formattedExpireAt };
        logOperation('createAnnouncement', ip, createdAnnouncement);
        result(null, createdAnnouncement);
    });
};

const checkForExpiredAnnouncements = () => {
    db.query("UPDATE `announcements` SET isExpired = 1 WHERE expireAt <= NOW() AND isExpired = 0", 
    (err, res) => {
        if (err) {
            if (debug == '1') {
                console.error("Failed to update expired announcements:", err);
            } else {
                console.log("Error occurred");
            }
        } else {
            console.log("Expired announcements updated successfully");
        }
    });
};

// Run this check every minute
setInterval(checkForExpiredAnnouncements, 60000);
