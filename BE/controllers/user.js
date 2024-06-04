import { getUsers } from "../models/UserModel.js";
import { v4 as uuidv4 } from 'uuid';
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

//creates account in db
export const saveAccount = async (req, res) => {
    const { name, phoneNumber, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        db.query(
            'INSERT INTO `users`(name, email, password, phoneNumber) VALUES (?,?,?,?)',    //--------------------------need to include image files
            [name, email, hashedPassword, phoneNumber],
            (error, results, fields) => {
                if (error) {
                    res.send(error);
                } else {
                    res.send(results);
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
};

export const verifyLogin = async (req, res) => {
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
                        const user = results[0];
                        const comparison = await bcrypt.compare(password, user.password);
                        if (comparison) {
                            const sessionId = uuidv4();
                            return res.send({
                                name: user.name,
                                isAdmin: user.isAdmin,
                                sessionId: sessionId
                            });
                        } else {
                            return res.send(false);
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