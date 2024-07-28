import db from '../config/database.js';

// Validation Functions
const validateTitle = (title) => /^[A-Za-z0-9\s]{1,30}$/.test(title);
const validateContent = (content) => content.length <= 500;

// Function to create a blog post
export const createBlog = async (req, res) => {
  const { blogID, authorID, authorEmail, dateCreated, content, title } = req.body;

  if (!validateTitle(title)) {
    return res.status(400).send({ error: 'Title must be alphanumeric and up to 30 characters long' });
  }
  if (!validateContent(content)) {
    return res.status(400).send({ error: 'Content must be up to 500 characters long' });
  }

  try {
    db.query(
      'INSERT INTO posts (blogID, authorID, authorEmail, dateCreated, content, title) VALUES (?, ?, ?, ?, ?, ?)',
      [blogID, authorID, authorEmail, dateCreated, content, title],
      (error, results) => {
        if (error) {
          return res.status(500).send(error);
        }
        res.status(201).send(results);
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

// Function to update a blog post
export const editBlog = async (req, res) => {
  const { blogID, title, content } = req.body;

  if (!validateTitle(title)) {
    return res.status(400).send({ error: 'Title must be alphanumeric and up to 30 characters long' });
  }
  if (!validateContent(content)) {
    return res.status(400).send({ error: 'Content must be up to 500 characters long' });
  }

  try {
    db.query(
      'UPDATE posts SET title = ?, content = ? WHERE blogID = ?',
      [title, content, blogID],
      (error, results) => {
        if (error) {
          return res.status(500).send(error);
        }
        res.status(200).send(results);
      }
    );
  } catch (error) {
    res.status(500).send(error);
  }
};

// Function to fetch a blog post by ID
export const getBlogById = async (blogID) => {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM posts WHERE blogID = ?',
      [blogID],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          if (results.length > 0) {
            resolve(results[0]);
          } else {
            resolve(null); // Blog post not found
          }
        }
      }
    );
  });
};
