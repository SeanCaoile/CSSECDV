import express from 'express';
import {
  getBlogs,
  createBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById
} from '../models/PostsModel.js'; // Adjust the import path as necessary

const router = express.Router();
const debug = process.env.DEBUG;

// Get all blogs
router.post('/showBlogs', (req, res) => {
  const currentPage = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;
  const offset = (currentPage - 1) * limit;

  getBlogs(currentPage, limit, offset, (err, data) => {
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
router.post('/createBlog', (req, res) => {
  const newBlog = req.body;
  createBlog(newBlog, (err, data) => {
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

// Get a blog by ID including the author's photo
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

// Delete a blog by ID (update isDeleted column to 1)
router.post('/blogs/deleteBlog', (req, res) => {
  const { blogID } = req.body;
  console.log('Received delete request with blogID:', blogID);
  deleteBlogById(blogID, (err, result) => {
    if (err) {
      if (debug === 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Blog not found' });
    }
    res.status(200).send({ message: 'Blog deleted successfully' });
  });
});

export default router;
