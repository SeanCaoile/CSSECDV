import db from '../config/database.js';
import { logOperation } from '../utils/logger.js'; // Import the logging function
import { userSession, getUserById } from '../controllers/user.js';

// Validation Functions
const validateTitle = (title) => /^[A-Za-z0-9\s]{1,30}$/.test(title);
const validateContent = (content) => content.length <= 500;
const validatePage = (currentPage) => /^[1-9][0-9]{0,2}$/.test(currentPage);
const debug = process.env.DEBUG;

// Get all blogs
export const getBlogs = (currentPage, limit, totalPages, offset, result) => {
    if(!validatePage(currentPage) || currentPage > totalPages){
        const errorMessage = { error: 'Invalid Page Number Inputted' };
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Failed to get blogs: ", err.stack);
            result(errorMessage, null);
        } else {
            console.log("An error occurred while processing");
            result('An error occurred while processing', null);
        }
        return;
    }
    db.query("SELECT COUNT(*) as count FROM `posts` WHERE isDeleted = 0", (err, countRes) => {
        if (err) {
            if (debug == 1) {
                console.error("Database error: ", err.stack);
                result(err.stack, null);
            } else {
                console.log("An error occurred while accessing data");
                result("An error occurred while accessing data", null);
            }
            return;
        }
    
        const totalItems = countRes[0].count;
        const totalPages = Math.ceil(totalItems / limit);
    
        // Perform the SELECT query for the current page
        db.query("SELECT * FROM `posts` WHERE isDeleted = 0 LIMIT ? OFFSET ?", [limit, offset], (err, res) => {
            if (err) {
                if (debug == 1) {
                    console.error("Database error: ", err.stack);
                    result(err.stack, null);
                } else {
                    console.log("An error occurred while accessing data");
                    result("An error occurred while accessing data", null);
                }
                return;
            } else {
                result(null, {
                    data: res,
                    currentPage: currentPage,
                    totalPages: totalPages,
                    totalItems: totalItems // Optional: include total items in response
                });
            }
        });
    });
};

// Create a new blog
export const createBlog = async (newBlog, ip, sessionID, result) => {
    const { content, title } = newBlog;
    const sessionId = sessionID;

    if (!validateTitle(title)) {
        const errorMessage = { error: 'Title must be alphanumeric and up to 30 characters long' };
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Validation error: ", err.stack);
            result(errorMessage, null);
        } else {
            console.log("Validation error");
            result('Validation error', null);
        }
        return;
    }
    if (!validateContent(content)) {
        const errorMessage = { error: 'Content must be up to 500 characters long' };
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Validation error: ", err.stack);
            result(errorMessage, null);
        } else {
            console.log("Validation error");
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
                    console.error("Database error: ", err.stack);
                    result(err.stack, null);
                } else {
                    console.log("An error occurred while accessing data");
                    result("An error occurred while accessing data", null);
                }
                return;
            }
            const createdBlog = { blogID: res.insertId, authorID, authorEmail, content, title, dateCreated };
            logOperation('createBlog', ip, createdBlog);
            result(null, createdBlog);
        });
    } else {
        if (debug == 1) {
            const errorMessage = { error: 'Invalid Session ID' };
            const err = new Error(errorMessage);
            console.error("Session error: ", err.stack);
            result(errorMessage, null);
        } else {
            console.log("Session error");
            result('Session error', null);
        }
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
    
    console.log("inside getBlogById");
    console.log("blogID is ", blogID);
    
    db.query(query, [blogID], (err, res) => {
      if (err) {
        if (debug == 1) {
          console.error("Database error: ", err.stack);
          result(err.stack, null);
        } else {
          console.log("An error occurred while accessing data");
          result("An error occurred while accessing data", null);
        }
        return;
      }
      console.log("after error check");
      if (res.length) {
        const blog = res[0];
        if (blog.authorPhoto) {
            console.log("images found");
          const base64Photo = Buffer.from(blog.authorPhoto, 'binary').toString('base64');
          blog.authorPhoto = `data:image/jpeg;base64,${base64Photo}`;
        }
        console.log("Blog found");
        result(null, blog);
      } else {
        console.log("Blog not found");
        result({ kind: "not_found" }, null);
      }
    });
  };

export const updateBlogById = (blog, sessionId, result) => {
    if(userSession.session == sessionId){
        const updateFields = [];
        const params = [];

        if (blog.title) {
            if (!validateTitle(blog.title)) {
                const errorMessage = { error: 'Title must be alphanumeric and up to 30 characters long' };
                if (debug == 1) {
                    const err = new Error(errorMessage);
                    console.error("Validation error: ", err.stack);
                    result(errorMessage, null);
                } else {
                    console.log("Validation error");
                    result('Validation error', null);
                }
                return;
            }
            updateFields.push('title = ?');
            params.push(blog.title);
        }
        if (blog.content) {
            if (!validateContent(blog.content)) {
                const errorMessage = { error: 'Content must be up to 500 characters long' };
                if (debug == 1) {
                    const err = new Error(errorMessage);
                    console.error("Validation error: ", err.stack);
                    result(errorMessage, null);
                } else {
                    console.log("Validation error");
                    result('Validation error', null);
                }
                return;
            }
            updateFields.push('content = ?');
            params.push(blog.content);
        }
        const blogID = blog.blogID
        params.push(blogID);

        db.query(
            `UPDATE posts SET ${updateFields.join(', ')} WHERE blogID = ? AND isDeleted = 0`,
            params,
            (err, res) => {
                if (err) {
                    if (debug == 1) {
                        console.error("Database error: ", err.stack);
                        result(err, null);
                    } else {
                        console.log("An error occurred while accessing data");
                        result("An error occurred while accessing data", null);
                    }
                    return;
                }
                if (res.affectedRows == 0) {
                    console.log("Blog not found");
                    result({ error: "blog not found" }, null);
                    return;
                }
                const { title, content } = blog;
                const updatedBlog = { blogID, title, content };
                //logOperation('updateBlog', ip, updatedBlog);
                result(null, { blogID, ...blog });
            }
        );
    }
    else{
        const errorMessage = { error: 'Invalid Session ID' };
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Session error: ", err.stack);
        }
        else{
            console.log("Session error");
        }
        
        result(errorMessage, null);
    }
    
};

// Delete a blog by ID
export const deleteBlogById = (blogID, callback) => {
    db.query('UPDATE posts SET isDeleted = 1 WHERE blogID = ?', [blogID], (err, results) => {
        if (err) {
            if (debug == 1) {
                console.error("Database error: ", err.stack);
                callback(err);
            } else {
                console.log("An error occurred while accessing data");
                callback("An error occurred while accessing data");
            }
            return;
        }
        callback(null, results);
    });
};


// Check authorization
export const checkAuthorization = (blogID, userID, callback) => {
    const queryBlog = 'SELECT authorID FROM posts WHERE blogID = ?';
    const queryUser = 'SELECT isAdmin FROM users WHERE id = ?';

    db.query(queryBlog, [blogID], (err, blogResult) => {
        if (err) {
            if (debug == 1) {
                console.error("Database error: ", err.stack);
                callback(err, null);
            } else {
                console.log("An error occurred while accessing data");
                callback("An error occurred while accessing data", null);
            }
            return;
        }
        if (blogResult.length == 0) {
            console.log("Blog not found");
            callback(null, { message: 'Blog not found' });
            return;
        }

        const authorID = blogResult[0].authorID;

        db.query(queryUser, [userID], (err, userResult) => {
            if (err) {
                if (debug == 1) {
                    console.error("Database error: ", err.stack);
                    callback(err, null);
                } else {
                    console.log("An error occurred while accessing data");
                    callback("An error occurred while accessing data", null);
                }
                return;
            }
            if (userResult.length == 0) {
                console.log("User not found");
                callback(null, { message: 'User not found' });
                return;
            }

            const isAdmin = userResult[0].isAdmin;
            const isAuthor = userID === authorID;

            callback(null, { isAuthor, isAdmin });
        });
    });
};
