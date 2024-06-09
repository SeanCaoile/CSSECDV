import { getUsers } from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import db from '../config/database.js';

let failedAttempts = {};
let isLocked = {};
let lastLoginAttempt = {};

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
        if (isLocked[email] && Date.now() - lastLoginAttempt[email] < 60000) { // 1 minute lockout
            console.log(`Account is locked. Please try again after ${Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000)} seconds.`);
            return res.status(401).send(`Account is locked. Please try again after ${Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000)} seconds.`);
        }

        console.log(`Failed attempts for ${email}: ${failedAttempts[email] || 0}`);
        console.log(`Is account locked for ${email}: ${isLocked[email]}`);

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
                            // Reset failed attempts and last login attempt if login successful
                            failedAttempts[email] = 0;
                            lastLoginAttempt[email] = Date.now();

                            return res.send({
                                name: user.name,
                                isAdmin: user.isAdmin
                            });
                        } else {
                            // Increment failed attempts and lock account if necessary
                            failedAttempts[email] = (failedAttempts[email] || 0) + 1;
                            if (failedAttempts[email] >= 5) {
                                isLocked[email] = true;
                                setTimeout(() => {
                                    isLocked[email] = false; // Unlock account after 1 minute
                                }, 60000);
                            }
                            lastLoginAttempt[email] = Date.now();

                            if (isLocked[email]) {
                                console.log(`Account is locked. Please try again after ${Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000)} seconds.`);
                                return res.status(401).send(`Account is locked. Please try again after ${Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000)} seconds.`);
                            } else {
                                return res.status(401).send('Incorrect email or password');
                            }
                        }
                    } else {
                        res.status(404).send('User does not exist');
                    }
                }
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
};