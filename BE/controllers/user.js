import { getUsers } from "../models/UserModel.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import cookie from 'cookie';

// Validation Functions
const validateName = (name) => /^[A-Za-z\s]{1,32}$/.test(name);
const validateEmail = (email) => /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,320})+$/.test(email);
const validatePassword = (password) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!#$^\-\_\=\+]).{12,55}$/.test(password);
const validatePhone = (phoneNumber) => /^09\d{9}$/.test(phoneNumber) || /^\+639\d{9}$/.test(phoneNumber);

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

export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    if (results.length > 0) {
                        resolve(results[0]);
                    } else {
                        resolve(null); // User not found
                    }
                }
            }
        );
    });
};

const userSession = {
    session: '',
    id: ''
}

// Creates account in db with validation
export const saveAccount = async (req, res) => {
    const { name, phoneNumber, email, password } = req.body;

    // Validate inputs
    if (!validateName(name)) { return res.status(400).send({ error: 'Only letters and spaces are allowed in name' }); }
    if (!validateEmail(email)) { return res.status(400).send({ error: 'Invalid email address' }); }
    if (!validatePassword(password)) { return res.status(400).send({ error: 'Invalid password' }); }
    if (!validatePhone(phoneNumber)) { return res.status(400).send({ error: 'Invalid phone number' }); } 

    try {
        //Check if email already exists in the database
        const [existingUser] = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });

        if (existingUser) {
            return res.status(400).send({ error: 'Email already exists' });
        }

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

    // Validate inputs
    if (!validateEmail(email)) {
        return res.status(400).send({ error: 'Invalid email address' });
    }

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
                const sessionId = uuidv4();
                userSession.id = user.id;
                userSession.session = sessionId;

                res.setHeader('Set-Cookie', cookie.serialize('sessionId', sessionId, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 2 * 60, // 2 minutes
                    path: '/'
                }));

                resetLoginAttempts(email);
                return res.send({ login: true });
            } else {
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
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const validate_session = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    try {
        // Check if the session ID matches the stored session ID
        if (sessionId === userSession.session) {
            // Session ID is valid, fetch user data from the database
            const user = await getUserById(userSession.id);
            if (user) {
                res.json({ authenticated: true, name: user.name, isAdmin: user.isAdmin });
            } else {
                // User not found
                res.json({ authenticated: false, error: "User not found" });
            }
        } else {
            // Session ID is invalid
            res.json({ authenticated: false, error: "Invalid session ID" });
        }
    } catch (error) {
        // Handle errors
        console.error("Error validating session:", error);
        res.status(500).json({ authenticated: false, error: "Internal server error" });
    }
}

export const removeSessionCookie = async(req, res) => {
    res.setHeader('Set-Cookie', cookie.serialize('sessionId', '', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 0, // Expire the cookie immediately
        path: '/'
    }));
    res.status(200).send({ message: 'Logged out successfully' });
}

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
