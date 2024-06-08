import { getUsers } from "../models/UserModel.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import cookie from 'cookie';

export const showUsers = (req, res) => {
    getUsers((err, data) => {
        if (err) {
            res.send(err);
        } else {
            res.json(data);
        }
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
                    res.status(500).send(error);
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
                    res.status(500).send(error);
                } else {
                    if (results.length > 0) {
                        const user = results[0];
                        const comparison = await bcrypt.compare(password, user.password);
                        if (comparison) {
                            const sessionId = uuidv4();
                            userSession.id = user.id;
                            userSession.session = sessionId
                            
                            res.setHeader('Set-Cookie', cookie.serialize('sessionId', sessionId, {
                                httpOnly: true,
                                secure: true, // Use secure cookies in production
                                sameSite: 'strict',
                                maxAge: 2 * 60, // 2 minutes in seconds
                                path: '/'
                            }));

                            return res.send({ login: true });
                        } else {
                            return res.send({ login: false });
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
