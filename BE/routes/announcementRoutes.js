import express from 'express';
import { getLastAnnouncement, createAnnouncement } from '../models/AnnouncementModel.js';

const router = express.Router();

const debug = process.env.DEBUG;


// Get the last announcement
router.get('/last', (req, res) => {
    getLastAnnouncement((err, announcement) => {
        if (err) {
            if (debug == 1){
                return res.status(500).send(err.stack);
              } else {
                return res.status(500).send("An error occurred while accessing data");
              }
        } else {
            res.send(announcement);
        }
    });
});

// Create a new announcement
router.post('/create', (req, res) => {
    const newAnnouncement = {
        content: req.body.content,
        email: req.body.email,
        expirationTime: req.body.expirationTime
    };
    const ip = req.ipv4;

    createAnnouncement(newAnnouncement, ip, (err, announcement) => {
        if (err) {
            if (debug == 1){
                
                return res.status(500).send(err.stack);
              } else {
                
                return res.status(500).send("An error occurred while accessing data");
              }
        } else {
            res.send(announcement);
        }
    });
});

export default router;
