import express from 'express';
import { getLastAnnouncement, createAnnouncement } from '../models/AnnouncementModel.js';

const router = express.Router();

// Get the last announcement
router.get('/last', (req, res) => {
    getLastAnnouncement((err, announcement) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving the last announcement."
            });
        } else {
            res.send(announcement);
        }
    });
});

// Create a new announcement
router.post('/create', (req, res) => {
    const newAnnouncement = {
        content: req.body.content,
        email: req.body.email
    };
    const ip = req.ipv4;

    createAnnouncement(newAnnouncement, ip, (err, announcement) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while creating the announcement."
            });
        } else {
            res.send(announcement);
        }
    });
});

export default router;
