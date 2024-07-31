import db from '../config/database.js';

// Validation Functions
const validateTitle = (title) => /^[A-Za-z0-9\s]{1,30}$/.test(title);
const validateContent = (content) => content.length <= 500;
const debug = process.env.DEBUG;

// Function to create a blog post
export const createBlog = async (req, res) => {
  const { blogID, authorID, authorEmail, dateCreated, content, title } = req.body;

  if (!validateTitle(title)) {
    const errorMessage = { error: 'Title must be alphanumeric and up to 30 characters long' };
    if (debug === '1') {
      return res.status(400).send(errorMessage);
    } else {
      return res.status(400).send('Validation error');
    }
  }
  if (!validateContent(content)) {
    const errorMessage = { error: 'Content must be up to 500 characters long' };
    if (debug === '1') {
      return res.status(400).send(errorMessage);
    } else {
      return res.status(400).send('Validation error');
    }
  }

  try {
    db.query(
      'INSERT INTO posts (blogID, authorID, authorEmail, dateCreated, content, title) VALUES (?, ?, ?, ?, ?, ?)',
      [blogID, authorID, authorEmail, dateCreated, content, title],
      (error, results) => {
        if (error) {
          if (debug === '1') {
            return res.status(500).send(error);
          } else {
            return res.status(500).send("An error occurred while accessing data");
          }
        }
        res.status(201).send(results);
      }
    );
  } catch (error) {
    if (debug === '1') {
      res.status(500).send(error);
    } else {
      res.status(500).send("An error occurred while accessing data");
    }
  }
};

// Function to update a blog post
export const editBlog = async (req, res) => {
  const { blogID, title, content } = req.body;

  if (!validateTitle(title)) {
    const errorMessage = { error: 'Title must be alphanumeric and up to 30 characters long' };
    if (debug === '1') {
      return res.status(400).send(errorMessage);
    } else {
      return res.status(400).send('Validation error');
    }
  }
  if (!validateContent(content)) {
    const errorMessage = { error: 'Content must be up to 500 characters long' };
    if (debug === '1') {
      return res.status(400).send(errorMessage);
    } else {
      return res.status(400).send('Validation error');
    }
  }

  try {
    db.query(
      'UPDATE posts SET title = ?, content = ? WHERE blogID = ?',
      [title, content, blogID],
      (error, results) => {
        if (error) {
          if (debug === '1') {
            return res.status(500).send(error);
          } else {
            return res.status(500).send("An error occurred while accessing data");
          }
        }
        res.status(200).send(results);
      }
    );
  } catch (error) {
    if (debug === '1') {
      res.status(500).send(error);
    } else {
      res.status(500).send("An error occurred while accessing data");
    }
  }
};

// Function to fetch a blog post by ID
export const getBlogById = async (req, res) => {
  const blogID = req.params.id;
  db.query(
    'SELECT * FROM posts WHERE blogID = ?',
    [blogID],
    (error, results) => {
      if (error) {
        if (debug === '1') {
          return res.status(500).send(error);
        } else {
          return res.status(500).send("An error occurred while accessing data");
        }
      }
      if (results.length > 0) {
        res.status(200).send(results[0]);
      } else {
        res.status(404).send({ message: 'Blog not found' });
      }
    }
  );
};

// Function to delete a blog post by ID
export const deleteBlogById = async (req, res) => {
  const { blogID } = req.body;
  db.query(
    'UPDATE posts SET isDeleted = 1 WHERE blogID = ?',
    [blogID],
    (error, results) => {
      if (error) {
        if (debug === '1') {
          return res.status(500).send(error);
        } else {
          return res.status(500).send("An error occurred while accessing data");
        }
      }
      if (results.affectedRows === 0) {
        res.status(404).send({ message: 'Blog not found' });
      } else {
        res.status(200).send({ message: 'Blog deleted successfully' });
      }
    }
  );
};
