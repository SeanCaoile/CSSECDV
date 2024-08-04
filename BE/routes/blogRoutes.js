import express from 'express';
import {
  getBlogs,
  createBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  checkAuthorization
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

// Get a blog by ID 
router.post('/blogs/getBlogById', (req, res) => {
  const { blogID } = req.body;
  getBlogById(blogID, (err, data) => {
    if (err) {
      if (debug === 1) {
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occurred while accessing data");
      }
    }
    if (!data) {
      if (debug === '1') {
        return res.status(404).send({ message: 'Blog not found' });
      } else {
        return res.status(404).send("Blog not found");
      }
    }
    res.json(data);
  });
});


// Update a blog by ID
router.post('/blogs/updateBlogById', (req, res) => {
  const { blogID, updatedBlog } = req.body;
  updateBlogById(blogID, updatedBlog, (err, data) => {
    if (err) {
      if (debug === 1) {
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occurred while accessing data");
      }
    }
    if (!data) {
      if (debug === '1') {
        return res.status(404).send({ message: 'Blog not found' });
      } else {
        return res.status(404).send("Blog not found");
      }
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

router.post('/blogs/checkAuthorization', async (req, res) => {
  const { blogID, userID } = req.body;
  
  try {
    const blog = await getBlogById(blogID);
    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    // Check if user is the author or admin
    const isAuthor = blog.authorID === userID;
    const user = await getUserById(userID); 

    res.json({ canEdit: isAuthor});
  } catch (error) {
    console.error('Error checking authorization:', error);
    res.status(500).json({ error: 'Failed to check authorization' });
  }
});
export default router;
