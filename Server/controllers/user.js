import { getUsers } from "../models/UserModel.js";

export const showUsers = (req, res) => {
    getUsers((err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
};