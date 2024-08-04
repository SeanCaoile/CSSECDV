import db from '../config/database.js';

const debug = process.env.DEBUG;

// Get all users
export const getUsers = (result) => {
    db.query("SELECT * FROM `users`", (err, res) => {
        if (err) {
            if (debug == '1') {
                result(err, null);
            } else {
                result("An error occurred while accessing data", null);
            }
            return;
        }
        result(null, res);
    });
};

// Create a new user
export const createUser = (newUser, result) => {
    const { name, email, password, phoneNumber, photo, isAdmin } = newUser;
    db.query("INSERT INTO `users` (name, email, password, phoneNumber, photo, isAdmin) VALUES (?, ?, ?, ?, ?, ?)", 
    [name, email, password, phoneNumber, photo, isAdmin], 
    (err, res) => {
        if (err) {
            if (debug == '1') {
                result(err, null);
            } else {
                result("An error occurred while accessing data", null);
            }
            return;
        }
        result(null, { id: res.insertId, ...newUser });
    });
};

// Get a user by ID
export const getUserById = (id, result) => {
    db.query("SELECT * FROM `users` WHERE id = ?", [id], (err, res) => {
        if (err) {
            if (debug == '1') {
                result(err, null);
            } else {
                result("An error occurred while accessing data", null);
            }
            return;
        }
        if (res.length) {
            result(null, res[0]);
        } else {
            result({ kind: "not_found" }, null);
        }
    });
};

// Update a user by ID
export const updateUserById = (id, user, result) => {
    const { name, email, password, phoneNumber, photo, isAdmin } = user;
    db.query(
        "UPDATE `users` SET name = ?, email = ?, password = ?, phoneNumber = ?, photo = ?, isAdmin = ? WHERE id = ?",
        [name, email, password, phoneNumber, photo, isAdmin, id],
        (err, res) => {
            if (err) {
                if (debug == '1') {
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
            result(null, { id, ...user });
        }
    );
};

// Delete a user by ID
export const deleteUserById = (id, result) => {
    db.query("DELETE FROM `users` WHERE id = ?", [id], (err, res) => {
        if (err) {
            if (debug == '1') {
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
        result(null, res);
    });
};
