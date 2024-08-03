import db from '../config/database.js';
import { logOperation } from '../utils/logger.js'; // Import the logging function
import { userSession, getUserById } from '../controllers/user.js';

// Validation Functions
const validateTitle = (title) => /^[A-Za-z0-9\s]{1,30}$/.test(title);
const validateContent = (content) => content.length <= 500;
const debug = process.env.DEBUG;

// Get all blogs
export const getBlogs = (currentPage, limit, offset, result) => {
    db.query("SELECT * FROM `posts` WHERE isDeleted = 0 LIMIT ? OFFSET ?", [limit, offset], (err, res) => {
        if (err) {
            if (debug === '1') {
                result(err, null);
            } else {
                result("An error occurred while accessing data", null);
            }
            return;
        } else {
            db.query('SELECT COUNT(*) AS count FROM `posts`', (err, countResult) => {
                if (err) {
                    if (debug === '1') {
                        result(err, null);
                    } else {
                        result("An error occurred while accessing data", null);
                    }
                    return;
                }
                const totalItems = countResult[0].count;
                const totalPages = Math.ceil(totalItems / limit);
                result(null, { data: res, currentPage: currentPage, totalPages: totalPages });
            });
        }
    });
};

// Create a new blog
export const createBlog = async (newBlog, ip, sessionID, result) => {
    // const { authorID, authorEmail, dateCreated, content, title } = newBlog;
    const { content, title } = newBlog;
    const sessionId = sessionID;

    if (!validateTitle(title)) {
        const errorMessage = { error: 'Title must be alphanumeric and up to 30 characters long' };
        if (debug === '1') {
            result(errorMessage, null);
        } else {
            result('Validation error', null);
        }
        return;
    }
    if (!validateContent(content)) {
        const errorMessage = { error: 'Content must be up to 500 characters long' };
        if (debug === '1') {
            result(errorMessage, null);
        } else {
            result('Validation error', null);
        }
        return;
    }

    if(userSession.session === sessionId){
        const user = await getUserById(userSession.id);
        const authorID = user.id;
        const authorEmail = user.email;
        const dateCreated = new Date().toISOString().slice(0, 19).replace('T', ' ')

        db.query("INSERT INTO `posts` (authorID, authorEmail, dateCreated, content, title) VALUES (?, ?, ?, ?, ?)", 
        [authorID, authorEmail, dateCreated, content, title], 
        (err, res) => {
            if (err) {
                if (debug == 1) {
                    result(err.stack, null);
                } else {
                    result("An error occurred while accessing data", null);
                }
                return;
            }
            const createdBlog = { blogID: res.insertId, ...newBlog };
            logOperation('createBlog', ip, createdBlog);
            result(null, createdBlog);
        });
    } else {
        const errorMessage = { error: 'Invalid Session ID' };
        result(errorMessage, null);
    }
};

// Get a blog by ID including the author's photo
export const getBlogById = (blogID, result) => {
    const query = `
        SELECT posts.*, users.photo as authorPhoto
        FROM posts
        JOIN users ON posts.authorID = users.id
        WHERE posts.blogID = ? AND posts.isDeleted = 0;
    `;

    db.query(query, [blogID], (err, res) => {
        if (err) {
            if (debug === '1') {
                result(err, null);
            } else {
                result("An error occurred while accessing data", null);
            }
            return;
        }
        if (res.length) {
            const blog = res[0];
            try{
                if (blog.authorPhoto) {
                    const base64Photo = Buffer.from(blog.authorPhoto, 'binary').toString('base64');
                    blog.authorPhoto = `data:image/jpeg;base64,${base64Photo}`;
                }
                result(null,blog);
            } catch (conversionError){
                result("An error orccurred while accessing the data", null);
            }            
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
        if (!validateTitle(title)) {
            const errorMessage = { error: 'Title must be alphanumeric and up to 30 characters long' };
            if (debug === '1') {
                result(errorMessage, null);
            } else {
                result(errorMessage, null);
                // result('Validation error', null);
            }
            return;
        }
        updateFields.push('title = ?');
        params.push(title);
    }
    if (content) {
        if (!validateContent(content)) {
            const errorMessage = { error: 'Content must be up to 500 characters long' };
            if (debug === '1') {
                result(errorMessage, null);
            } else {
                result(errorMessage, null);
                // result('Validation error', null);
            }
            return;
        }
        updateFields.push('content = ?');
        params.push(content);
    }

    params.push(blogID);

    db.query(
        `UPDATE posts SET ${updateFields.join(', ')} WHERE blogID = ? AND isDeleted = 0`,
        params,
        (err, res) => {
            if (err) {
                if (debug === '1') {
                    result(err, null);
                } else {
                    result("An error occurred while accessing data", null);
                }
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            const updatedBlog = { blogID, ...blog };
            logOperation('updateBlogById', updatedBlog);
            result(null, updatedBlog);
        }
    );
};

// Delete a blog by ID
export const deleteBlogById = (blogID, callback) => {
    db.query('UPDATE posts SET isDeleted = 1 WHERE blogID = ?', [blogID], (err, results) => {
        if (err) {
            if (debug === '1') {
                callback(err);
            } else {
                callback("An error occurred while accessing data");
            }
            return;
        }
        logOperation('deleteBlogById', { blogID });
        callback(null, results);
    });
};

// Edit blog (assuming session handling and authorization are managed)
export const editBlog = async (req, res) => {
    const sessionId = req.cookies.sessionId; // Retrieve sessionId from cookies

    // Validate sessionId
    if (!isValidSession(sessionId)) {
        if (debug === '1') {
            return res.status(401).send({ error: 'Unauthorized: Invalid session ID' });
        } else {
            return res.status(401).send("Unauthorized access");
        }
    }

    const { blogID, updatedContent } = req.body;

    try {
        // Fetch the blog post from the database and perform editing
        const blog = await fetchBlogById(blogID);

        if (!blog) {
            if (debug === '1') {
                return res.status(404).send({ error: 'Blog not found' });
            } else {
                return res.status(404).send("Blog not found");
            }
        }

        // Check if the current user has permission to edit this blog
        if (blog.authorEmail !== req.session.user.email) {
            if (debug === '1') {
                return res.status(403).send({ error: 'You are not authorized to edit this blog' });
            } else {
                return res.status(403).send("You are not authorized to edit this blog");
            }
        }

        // Update the blog content in the database
        await updateBlog(blogID, { content: updatedContent });

        res.status(200).send({ message: 'Blog updated successfully' });
    } catch (error) {
        if (debug === '1') {
            res.status(500).send(error);
        } else {
            res.status(500).send("An error occurred while accessing data");
        }
    }
};
