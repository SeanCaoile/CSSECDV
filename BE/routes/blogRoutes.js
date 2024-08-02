import express from 'express';
import {
  getBlogs,
  createBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById
} from '../models/PostsModel.js'; // Adjust the import path as necessary

const debug = process.env.DEBUG;

const router = express.Router();

// Get all blogs
router.get('/blogs', (req, res) => {
  getBlogs((err, data) => {
    if (err) {
      if (debug === 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    res.json(data);
  });
});

// Create a new blog
router.post('/blogs', (req, res) => {
  const newBlog = req.body;
  const ip = req.ipv4; // Assuming the IP address is passed in the request
  createBlog(newBlog, ip, (err, data) => {
    if (err) {
      if (debug === 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    res.status(201).json(data);
  });
});

// Get a blog by ID
router.get('/blogs/:id', (req, res) => {
  const blogID = req.params.id;
  getBlogById(blogID, (err, data) => {
    if (err) {
      if (debug === 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    if (!data) {
      return res.status(404).send({ message: 'Blog not found' });
    }
    res.json(data);
  });
});

// Update a blog by ID
router.put('/blogs/:id', (req, res) => {
  const blogID = req.params.id;
  const updatedBlog = req.body;
  updateBlogById(blogID, updatedBlog, (err, data) => {
    if (err) {
      if (debug === 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    if (!data) {
      return res.status(404).send({ message: 'Blog not found' });
    }
    res.json(data);
  });
});

// Delete a blog by ID
router.delete('/blogs/:id', (req, res) => {
  const blogID = req.params.id;
  deleteBlogById(blogID, (err, data) => {
    if (err) {
      if (debug === 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    if (!data.affectedRows) {
      return res.status(404).send({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  });
});

export default router;
