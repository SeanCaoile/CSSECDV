import { getUsers } from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import db from '../config/database.js';


export const showUsers = (req, res) => {
    getUsers((err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
    });
};

//currently saveAccount only inserts an email and password into the database
export const saveAccount = async (req, res) => {
    const { email, password } = req.body;
    try {
        const saltRounds = 10; //salt 10 times
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        db.query(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword],
            (error, results, fields) => {
                if (error) {
                    res.send(error);
                } else {
                    res.send(results);
                }
            }
        );
    } catch (error) {
        res.status(500).send(error); //server encountered an unexpected condition error
    }
};

export const verifyPassword = async (req, res) => {
    const { email, password } = req.body;
    try {
        db.query(
            'SELECT * FROM users WHERE email = ?',
            [email],
            async (error, results, fields) => {
                if (error) {
                    res.send(error);
                } else {
                    if (results.length > 0) {
                        const comparison = await bcrypt.compare(password, results[0].password);
                        if (comparison) {
                            res.send('Success');
                        } else {
                            res.send('Invalid password');
                        }
                    } else {
                        res.send('User does not exist');
                    }
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
};