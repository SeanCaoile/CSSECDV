import express from 'express';
import {
  getBlogs,
  createBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById
} from '../models/PostsModel.js'; // Adjust the import path as necessary

const router = express.Router();

// Get all blogs
router.get('/blogs', (req, res) => {
  const currentPage = parseInt(req.query.currentPage) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (currentPage - 1) * limit;
  getBlogs(currentPage, limit, offset, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(data);
  });
});

// Create a new blog
router.post('/blogs', (req, res) => {
  const newBlog = req.body;
  createBlog(newBlog, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(201).json(data);
  });
});

// Get a blog by ID
router.get('/blogs/:id', (req, res) => {
  const blogID = req.params.id;
  getBlogById(blogID, (err, data) => {
    if (err) {
      return res.status(500).send(err);
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
      return res.status(500).send(err);
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
      return res.status(500).send(err);
    }
    if (!data.affectedRows) {
      return res.status(404).send({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  });
});

export default router;
