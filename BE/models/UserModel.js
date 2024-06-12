import db from '../config/database.js';

export const getUsers = (result) => {
    db.query("SELECT * FROM `users`", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};