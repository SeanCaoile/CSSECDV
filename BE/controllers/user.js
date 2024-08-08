import { getUsers } from "../models/UserModel.js";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import db from '../config/database.js';
import cookie from 'cookie';
import fs from 'fs';
import { logOperation } from '../utils/logger.js'; // Import the logging function
import { error } from "console";

// Validation Functions
const validateName = (name) => /^[A-Za-z\s]{1,32}$/.test(name);
const validateEmail = (email) => /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,320})+$/.test(email);
const validatePassword = (password) => /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[~!#$^\-\_\=\+]).{12,55}$/.test(password);
const validatePhone = (phoneNumber) => /^09\d{9}$/.test(phoneNumber) || /^\+639\d{9}$/.test(phoneNumber);

const failedAttempts = {};
const isLocked = {};
const lastLoginAttempt = {};

const debug = process.env.DEBUG;

export const showUsers = (req, res) => {
    getUsers((err, data) => {
        if (err) {
            if (debug == 1) {
                console.error("error:", err.stack);
                result(err.stack, null);
                return res.status(500).send(err);
            } else {
                console.log("Error occurred");
                return res.status(500).send("An error occurred while accessing data");
            }
        }
        res.json(data);
    });
};

export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (err, results) => {
                if (err) {
                    if (debug == 1) {
                        console.error("error:", err.stack);
                        result(err.stack, null);
                        reject(error);
                    } else {
                        console.log("Error occurred");
                        reject("An error occurred while accessing data");
                    }
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
export const userSession = {
    session: '',
    id: '',
    IP: ''
}

export const fetchImage = (req, res) => {
    const userId = userSession.id; 

    db.query('SELECT photo FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            if (debug == 1) {
                console.error("error:", err.stack);
                result(err.stack, null);
                return res.status(500).send(error);
            } else {
                console.log("Error occurred");
                return res.status(500).send("An error occurred while accessing data");
            }
        }
        if (results.length > 0) {
            const photo = results[0].photo;
            results.contentType('image/jpg');
            res.send(photo);
        } else {
            if (debug == 1) {
                console.error("error:", err.stack);
                result(err.stack, null);
                res.status(404).send('Image not found');
            } else {
                console.log("Error occurred");
                res.status(404).send("An error occurred while accessing data");
            }
            result("Error occurred", null);
            return;
        }
    });
}


// Creates account in db with validation
export const saveAccount = async (req, res) => {
    const { name, phoneNumber, email, password } = req.body;
    const fileTypeSignatures = {
        jpeg: "ffd8", // Signature for both .jpg and .jpeg
        png: "89504e47"
    };
    const fileData = fs.readFileSync(req.file.path);
    const fileSignature = fileData.toString('hex', 0, 4); // Extracting the first 4 bytes as hexadecimal string

    // Validate inputs
    if (!validateName(name)) { 
        const errorMessage = 'Invalid name';
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Invalid name:", err.stack);
            result(err.stack, null);
            return res.status(400).send(error);
        } else {
            console.log("Error occurred");
            return res.status(400).send({ error: 'Only letters and spaces are allowed in name' });
        }
    }
    if (!validateEmail(email)) { 
        const errorMessage = 'Invalid email address';
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Invalid email address:", err.stack);
            result(err.stack, null);
            return res.status(400).send(error); 
        } else {
            console.log("Error occurred");
            return res.status(400).send({ error: 'Invalid email address' }); 
        }
    }
    if (!validatePassword(password)) { 
        const errorMessage = 'Invalid password';
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Invalid password:", err.stack);
            result(err.stack, null);
            return res.status(400).send(error); 
        } else {
            console.log("Error occurred");
            return res.status(400).send({ error: 'Invalid password' }); 
        }
    }
    if (!validatePhone(phoneNumber)) { 
        const errorMessage = 'Invalid phone number';
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Invalid phone number:", err.stack);
            result(err.stack, null);
            return res.status(400).send(error); 
        } else {
            console.log("Error occurred");
            return res.status(400).send({ error: 'Invalid phone number' }); 
        }
    } 

    if (fileSignature.startsWith(fileTypeSignatures.jpeg) || fileSignature.startsWith(fileTypeSignatures.png)) {
        try {
            //Check if email already exists in the database
            const [existingUser] = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                    if (err) {
                        if(debug == 1){
                            console.error("error:", error.stack);
                            result(err.stack, null);
                            reject(err);
                        } else {
                            console.log("An error occurred while accessing data");
                            reject("An error occurred while accessing data");
                        }
                    } else {
                        resolve(results);
                    }
                });
            });
    
            if (existingUser) {
                return res.status(400).send({ error: 'Email already exists' });
            }
    
            const imageBuffer = Buffer.from(fileData);
            fs.unlinkSync(req.file.path);
    
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const ip = req.ipv4;

            logOperation('Register', ip, {result: "success", name: name, email: email, phoneNumber: phoneNumber} );
            db.query(
                'INSERT INTO `users`(name, email, password, phoneNumber, photo) VALUES (?,?,?,?,?)',
                [name, email, hashedPassword, phoneNumber, imageBuffer],
                (err, results) => {
                    if (err) {
                        if(debug == 1){
                            console.error("error:", error.stack);
                            result(err.stack, null);
                            return res.status(500).send(error);
                        } else {
                            console.log("An error occurred while accessing data");
                            return res.status(500).send("An error occurred while accessing the data");
                        }
                    }
                    res.status(201).send(results);
                }
            );
        } catch (error) {
            const errorMessage = 'An error occured while accessing the data';
            if (debug == 1) {
                const err = new Error(errorMessage);
                console.error("An error occured while accessing the data", err.stack);
                result(err.stack, null);
                res.status(500).send(error);
            } else {
                console.log("Error occurred");
                res.status(500).send("An error occurred while accessing the data");
            }
        }
    }
    else {
        // File type is not supported
        const errorMessage = 'Invalid file type. Only JPEG, PNG, and JPG files are allowed';
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Invalid file type. Only JPEG, PNG, and JPG files are allowed", err.stack);
            result(err.stack, null);
            return res.status(400).send(error);
        } else {
            console.log("Error occurred");
            return res.status(400).send({ error: 'Invalid file type. Only JPEG, PNG, and JPG files are allowed.' });
        }
    }
};

export const verifyLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!validateEmail(email)) { 
        const errorMessage = 'Invalid email address';
        if (debug == 1) {
            const err = new Error(errorMessage);
            console.error("Invalid email address:", err.stack);
            result(err.stack, null);
            return res.status(400).send(error); 
        } else {
            console.log("Error occurred");
            return res.status(400).send({ error: 'Invalid email address' }); 
        }
    }

    try {
        if (isLocked[email] && Date.now() - lastLoginAttempt[email] < 60000) {
            const lockoutTime = Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000);
            const errorMessage = 'Account is locked';
            if(debug == 1){
                const err = new Error(errorMessage);
                console.error("Account is locked", err.stack);
                return res.status(401).send({
                    message: `Account is locked. Please try again after ${lockoutTime} seconds.`,
                    failedAttempts: failedAttempts[email],
                    isLocked: true
                });
            } else {
                const errorMessage = 'Account is temporarily suspended';
                const err = new Error(errorMessage);
                console.error("Account is temporarily suspended", err.stack);
                return res.status(401).send({
                    message: `Account is temporarily suspended.`,
                    failedAttempts: failedAttempts[email],
                    isLocked: true
                });
            }
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
            if (err) {
                if(debug == 1){
                    console.error("error:", err.stack);
                    result(err.stack, null);
                    return res.status(500).send(err);
                } else {
                    console.log("An error occurred while accessing data");
                    return res.status(500).send("An error occurred while accessing the data");
                }
            } 
            
            if (results.length == 0) {
                const errorMessage = 'User does not exist';
                if(debug == 1){
                    const err = new Error(errorMessage);
                    console.error("User does not exist:", err.stack);
                    return result(err.stack, null);
                } else {
                    console.log("Error occurred");
                    return result(errorMessage, null);
                }
            }

            const user = results[0];
            const comparison = await bcrypt.compare(password, user.password);

            if (comparison) {
                const ip = req.ipv4;
                const sessionId = uuidv4();
                userSession.id = user.id;

                userSession.session = sessionId;
                userSession.IP = ip

                //console.log(`Login attempt from IP: ${ip}`)
                logOperation('Login', ip, {result: "success", email: email, id: userSession.id} );
                //console.log(`saved attempt from IP: ${userSession.IP}`)

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
                const ip = req.ipv4;
                logOperation('Login', ip, {result: "failed", email: email} );
                
                if (isLocked[email]) {
                    const errorMessage = 'Account is locked';
                    if(debug == 1){
                        const err = new Error(errorMessage);
                        console.error("Account is locked", err.stack);
                        return res.status(401).send({
                            message: `Account is locked. Please try again after ${lockoutTime} seconds.`,
                            failedAttempts: failedAttempts[email],
                            isLocked: true
                        });
                    } else {
                        const errorMessage = 'Account is temporarily suspended';
                        const err = new Error(errorMessage);
                        console.error("Account is temporarily suspended", err.stack);
                        return res.status(401).send({
                            message: `Account is temporarily suspended`,
                            failedAttempts: failedAttempts[email],
                            isLocked: true
                        });
                    }
                    
                } else {
                    if (debug == 1) {
                        const errorMessage = 'Incorrect Password for Inputted Email';
                        const err = new Error(errorMessage);
                        console.error("Incorrect Password for Inputted Email", err.stack);
                        return res.status(401).send({
                            message: 'Incorrect Password for Inputted Email',
                            failedAttempts: failedAttempts[email],
                            isLocked: false
                        });
                    } else {
                        const errorMessage = 'Incorrect email or password';
                        const err = new Error(errorMessage);
                        console.error("Incorrect email or password", err.stack);
                        return res.status(401).send({
                            message: 'Incorrect email or password',
                            failedAttempts: failedAttempts[email],
                            isLocked: false
                        });
                    }
                }
            }
        });
    } catch (error) {
        const errorMessage = 'An error occurred while accessing the data';
        if(debug == 1){
            const err = new Error(errorMessage);
            console.error("An error occurred wile accessing the data", err.stack);
            res.status(500).send(error);
        } else {
            console.log("Error occurred");
            res.status(500).send("An error occurred while accessing the data");
        }
    }
};

export const validate_session = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    const ip = req.ipv4;

    try {
        // Check if the session ID matches the stored session ID
        if (sessionId == userSession.session && ip == userSession.IP) {
            const user = await getUserById(userSession.id);

            if (user) {
                res.setHeader('Set-Cookie', cookie.serialize('sessionId', sessionId, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 2 * 60, // 2 minutes
                    path: '/'
                }));
                
                const photoData = user.photo;
                const base64Photo = Buffer.from(photoData, 'binary').toString('base64');
                const photoString = `data:/image/png;base64,${base64Photo}`
                res.json({ authenticated: true, name: user.name, photo: photoString, isAdmin: user.isAdmin
                    , email: user.email, id: user.id
                 }); //Please read:::: I added the email and id to the response, not sure how this will affect security
            } else {
                // User not found
                res.json({ authenticated: false, error: "User not found" });
            }
        } else {
            if (sessionId !== userSession.session) {
                if(debug == 1){
                    const errorMessage = 'Invalid Session ID';
                    const err = new Error(errorMessage);
                    console.error("Invalid Session ID", err.stack);
                    res.json({ authenticated: false, error: "Invalid Session ID" });
                } else {
                    const errorMessage = 'Disconnected from server';
                    const err = new Error(errorMessage);
                    console.error("Disconnected from server", err.stack);
                    res.json({ authenticated: false, error: "Disconnected from the server" });
                }
            }
            else if (ip !== userSession.IP) {
                if(debug == 1){
                    const errorMessage = 'IP Mismatch';
                    const err = new Error(errorMessage);
                    console.error("IP Mismatch", err.stack);
                    res.json({ authenticated: false, error: "IP Address Mismatch" });
                } else {
                    const errorMessage = 'Disconnected from server';
                    const err = new Error(errorMessage);
                    console.error("Disconnected from server", err.stack);
                    res.json({ authenticated: false, error: "Disconnected from the server" });
                }
            }
        }
    } catch (error) {
        // Handle errors
        // console.error("Error validating session:", error);
        const errorMessage = 'Internal server error';
        if(debug == 1){
            const err = new Error(errorMessage);
            console.error("Internal server error", err.stack);
            res.status(500).json({ authenticated: false, error});
        } else {
            console.log("Error occurred");
            res.status(500).json({ authenticated: false, error: "Internal server error" });
        }
    }
}

export const validate_admin = async (req, res) => {
    const sessionId = req.cookies.sessionId;

    try {
        // Check if the session ID matches the stored session ID
        if (sessionId == userSession.session) {
            const user = await getUserById(userSession.id);
            if (user) {
                if (user.isAdmin == 1){
                    res.json({ authenticated: true });
                } else {
                    res.json({ authenticated: false, error: "User Intrusion"});
                }
            } else {
                // User not found
                res.json({ authenticated: false, error: "User not found" });
            }
        } else {
        
           if(debug == 1){
                const errorMessage = 'Invalid Session ID';
                const err = new Error(errorMessage);
                console.error("Invalid Session ID", err.stack);
                res.json({ authenticated: false, error: "Invalid Session ID" });
            } else {
                const errorMessage = 'Disconnected from server';
                const err = new Error(errorMessage);
                console.error("Disconnected from server", err.stack);
                res.json({ authenticated: false, error: "Disconnected from the server" });
            }
            
        }
    } catch (error) {
        // Handle errors
        // console.error("Error validating session:", error);
        if(debug == 1){
            res.status(500).json({ authenticated: false, error: error.stack});
        } else {
            res.status(500).json({ authenticated: false, error: "Internal server error" });
        }
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
    const ip = req.ipv4;
    logOperation('Invalid Session', ip, {result: "Removed Cookie"} );
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
