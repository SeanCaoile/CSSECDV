import express from 'express';
import {
  getBlogs,
  createBlog,
  getBlogById,
  updateBlogById,
  deleteBlogById,
  checkAuthorization,
  checkBlogDeleted
} from '../models/PostsModel.js'; // Adjust the import path as necessary

const router = express.Router();
const debug = process.env.debug;

// Get all blogs
router.post('/showBlogs', (req, res) => {
  const currentPage = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;
  const totalPages = parseInt(req.body.totalPages) || 1;
  const offset = (currentPage - 1) * limit;

  getBlogs(currentPage, limit, totalPages, offset, (err, data) => {
    if (err) {
        return res.status(500).send(err);
    }
    res.json(data);
  });
});

// Create a new blog
router.post('/createBlog', (req, res) => {
  const newBlog = req.body;
  const sessionId = req.cookies.sessionId;
  const ip = req.ipv4; // Assuming the IP address is passed in the request
  createBlog(newBlog, ip, sessionId, (err, data) => {
    if (err) {
      if (debug == 1){
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
      if (debug == 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occurred while accessing data");
      }
    }
    if (!data) {
      if (debug == 1) {
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
  const { updatedBlog } = req.body;
  const sessionId = req.cookies.sessionId;
  const ip = req.ipv4;
  console.log("ip is ", ip + " session id is ", sessionId);
  updateBlogById(updatedBlog, ip, sessionId, (err, data) => {
    if (err) {
      if (debug == 1) {
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occurred while accessing data");
      }
    }
    if (!data) {
      if (debug == 1) {
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
      if (debug == 1){
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occured while accessing data");
      }
    }
    if (result.affectedRows == 0) {
      return res.status(404).send({ message: 'Blog not found' });
    }
    res.status(200).send({ message: 'Blog deleted successfully' });
  });
});

router.post('/blogs/checkAuthorization', (req, res) => {
  const { blogID, userID } = req.body;
  checkBlogDeleted(blogID, (err, data) => {
    if (err) {
      if (debug == 1) {
        return res.status(500).send(err);
      } else {
        return res.status(500).send("An error occurred while accessing data");
      }
    }
    if (!data) {
      if (debug == 1) {
        return res.status(404).send({ message: 'Blog not found' });
      } else {
        return res.status(404).send("Blog not found");
      }
    }
    if (data == true ){
      const blogDeleted = true;
    }
    else{
      const blogDeleted = false;
    }
  })

  if(blogDeleted == true){
    getBlogById(blogID, (err, data) => {
      if (err) {
        if (debug == 1) {
          return res.status(500).send(err);
        } else {
          return res.status(500).send("An error occurred while accessing data");
        }
      }
      if (!data) {
        if (debug == 1) {
          return res.status(404).send("Blog not found");
        }
      }
      if (userID == data.authorID){
        res.json({ canEdit: 1 });
      }
      else{
        res.json({ canEdit: 0 })
      }
    });
  } else {
    return res.status(404).send("Blog not found");
  }
  
});
export default router;
