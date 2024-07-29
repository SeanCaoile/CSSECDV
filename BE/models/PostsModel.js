import db from '../config/database.js';

// Get all blogs
export const getBlogs = (currentPage, limit, offset, result) => {
    db.query("SELECT * FROM `posts` WHERE isDeleted = 0 LIMIT ? OFFSET ?", [limit, offset], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        } else {
            db.query('SELECT COUNT(*) AS count FROM `posts`', (err, countResult) => {
                if (err) {
                    console.log("error: ", err);
                    result(err, null);
                    return;
                }
                else {
                    const totalItems = countResult[0].count;
                    const totalPages = Math.ceil(totalItems / limit);
                    result(null, {data: res, currentPage: currentPage, totalPages: totalPages});
                }
            })
        }
    });
};

// Create a new blog
export const createBlog = (newBlog, result) => {
    const { authorID, authorEmail, dateCreated, content, title } = newBlog;
    db.query("INSERT INTO `posts` (authorID, authorEmail, dateCreated, content, title) VALUES (?, ?, ?, ?, ?)", 
    [authorID, authorEmail, dateCreated, content, title], 
    (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { blogID: res.insertId, ...newBlog });
    });
};

// Get a blog by ID
export const getBlogById = (blogID, result) => {
    db.query("SELECT * FROM `posts` WHERE blogID = ?", [blogID], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
        } else {
            result({ kind: "not_found" }, null);
        }
    });
};

// Update a blog by ID
export const updateBlogById = (blogID, blog, result) => {
    const { title, content } = blog;
    const updateFields = [];
    const params = [];

    if (title) {
        updateFields.push('title = ?');
        params.push(title);
    }
    if (content) {
        updateFields.push('content = ?');
        params.push(content);
    }

    params.push(blogID);

    db.query(
        `UPDATE posts SET ${updateFields.join(', ')} WHERE blogID = ?`,
        params,
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { blogID, ...blog });
        }
    );
};

export const editBlog = async (req, res) => {
    const sessionId = req.cookies.sessionId; // Retrieve sessionId from cookies
  
    // Validate sessionId
    if (!isValidSession(sessionId)) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
  
    // Assuming you have validated the session, proceed with editing the blog
    const { blogID, updatedContent } = req.body;
  
    try {
      // Fetch the blog post from the database and perform editing
      const blog = await fetchBlogById(blogID);
      
      if (!blog) {
        return res.status(404).send({ error: 'Blog not found' });
      }
  
      // Check if the current user has permission to edit this blog
      if (blog.authorEmail !== req.session.user.email) {
        return res.status(403).send({ error: 'You are not authorized to edit this blog' });
      }
  
      // Update the blog content in the database
      await updateBlog(blogID, { content: updatedContent });
  
      res.status(200).send({ message: 'Blog updated successfully' });
    } catch (error) {
      console.error('Error editing blog:', error);
      res.status(500).send({ error: 'Internal server error' });
    }
  };
  
// Delete a blog by ID
export const deleteBlogById = (blogID, callback) => {
    db.query('UPDATE posts SET isDeleted = 1 WHERE blogID = ?', [blogID], (err, results) => {
      if (err) {
        return callback(err);
      }
      callback(null, results);
    });
  };
  
