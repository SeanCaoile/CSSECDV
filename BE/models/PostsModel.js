import db from '../config/database.js';

// Get all blogs
export const getBlogs = (result) => {
    db.query("SELECT * FROM `blogs`", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

// Create a new blog
export const createBlog = (newBlog, result) => {
    const { authorID, authorEmail, dateCreated, content, replies, title } = newBlog;
    db.query("INSERT INTO `blogs` (authorID, authorEmail, dateCreated, content, replies, title) VALUES (?, ?, ?, ?, ?, ?)", 
    [authorID, authorEmail, dateCreated, content, replies, title], 
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
    db.query("SELECT * FROM `blogs` WHERE blogID = ?", [blogID], (err, res) => {
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
    const { authorID, authorEmail, dateCreated, content, replies, title } = blog;
    db.query(
        "UPDATE `blogs` SET authorID = ?, authorEmail = ?, dateCreated = ?, content = ?, replies = ?, title = ? WHERE blogID = ?",
        [authorID, authorEmail, dateCreated, content, replies, title, blogID],
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

// Delete a blog by ID
export const deleteBlogById = (blogID, result) => {
    db.query("DELETE FROM `blogs` WHERE blogID = ?", [blogID], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, res);
    });
};
