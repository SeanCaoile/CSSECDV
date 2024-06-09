import { getUsers } from "../models/UserModel.js";
import bcrypt from 'bcrypt';
import db from '../config/database.js';

const failedAttempts = {};
const isLocked = {};
const lastLoginAttempt = {};

export const showUsers = (req, res) => {
    getUsers((err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.json(data);
    });
};

export const saveAccount = async (req, res) => {
    const { name, phoneNumber, email, password } = req.body;
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        db.query(
            'INSERT INTO `users` (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)', 
            [name, email, hashedPassword, phoneNumber],
            (error, results) => {
                if (error) {
                    return res.status(500).send(error);
                }
                res.status(201).send(results);
            }
        );
    } catch (error) {
        res.status(500).send(error);
    }
};

export const verifyLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (isLocked[email] && Date.now() - lastLoginAttempt[email] < 60000) {
            const lockoutTime = Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000);
            return res.status(401).send({
                message: `Account is locked. Please try again after ${lockoutTime} seconds.`,
                failedAttempts: failedAttempts[email],
                isLocked: true
            });
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                return res.status(500).send(error);
            }

            if (results.length === 0) {
                return res.status(404).send('User does not exist');
            }

            const user = results[0];
            const comparison = await bcrypt.compare(password, user.password);

            if (comparison) {
                resetLoginAttempts(email);
                return res.send({ name: user.name, isAdmin: user.isAdmin });
            }

            handleFailedLoginAttempt(email);
            const lockoutTime = Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000);
            
            if (isLocked[email]) {
                return res.status(401).send({
                    message: `Account is locked. Please try again after ${lockoutTime} seconds.`,
                    failedAttempts: failedAttempts[email],
                    isLocked: true
                });
            } else {
                return res.status(401).send({
                    message: 'Incorrect email or password',
                    failedAttempts: failedAttempts[email],
                    isLocked: false
                });
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

const resetLoginAttempts = (email) => {
    failedAttempts[email] = 0;
    lastLoginAttempt[email] = Date.now();
};

const handleFailedLoginAttempt = (email) => {
    failedAttempts[email] = (failedAttempts[email] || 0) + 1;
    lastLoginAttempt[email] = Date.now();

    if (failedAttempts[email] >= 5) {
        isLocked[email] = true;
        setTimeout(() => {
            isLocked[email] = false;
        }, 60000);
    }
};
