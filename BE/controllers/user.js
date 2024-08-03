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
            if (debug===1){
                return res.status(500).send(err);
            } else {
                return res.status(500).send("An error occured while accessing data");
            }
        }
        res.json(data);
    });
};

// export const getUserById = (userId) => {
//     return new Promise((resolve, reject) => {
//         db.query(
//             'SELECT * FROM users WHERE id = ?',
//             [userId],
//             (error, results) => {
//                 if (error) {
//                     reject(error);
//                 } else {
//                     if (results.length > 0) {
//                         resolve(results[0]);
//                     } else {
//                         resolve(null); // User not found
//                     }
//                 }
//             }
//         );
//     });
// };

export const getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        db.query(
            'SELECT * FROM users WHERE id = ?',
            [userId],
            (error, results) => {
                if (error) {
                    if (debug === 1) {
                        reject(error);
                    }
                    else{
                        reject("An error occured while accessing data");
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

const userSession = {
    session: '',
    id: '',
    IP: ''
}

export const fetchImage = (req, res) => {
    const userId = userSession.id; 

    db.query('SELECT photo FROM users WHERE id = ?', [userId], (error, results) => {
        if (error) {
            if(debug===1){
                return res.status(500).send(error);
            } else {
                return res.status(500).send("An error occured while accessing data");
            }
            
        }
        if (results.length > 0) {
            const photo = results[0].photo;
            results.contentType('image/jpg');
            res.send(photo);
        } else {
            if(debug===1){
                res.status(404).send('Image not found');
            } else {
                res.status(404).send("An error occured while accessing data");
            }
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
        if(debug===1){
            return res.status(400).send(error);
        } else {
            return res.status(400).send({ error: 'Only letters and spaces are allowed in name' });
        }
    }
    if (!validateEmail(email)) { 
        if(debug===1){
            return res.status(400).send(error); 
        } else {
            return res.status(400).send({ error: 'Invalid email address' }); 
        }
    }
    if (!validatePassword(password)) { 
        if (debug===1) {
            return res.status(400).send(error); 
        } else {
            return res.status(400).send({ error: 'Invalid password' }); 
        }
    }
    if (!validatePhone(phoneNumber)) { 
        if (debug===1) {
            return res.status(400).send(error); 
        } else {
            return res.status(400).send({ error: 'Invalid phone number' }); 
        }
    } 

    if (fileSignature.startsWith(fileTypeSignatures.jpeg) || fileSignature.startsWith(fileTypeSignatures.png)) {
        try {
            //Check if email already exists in the database
            const [existingUser] = await new Promise((resolve, reject) => {
                db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                    if (error) {
                        if(debug===1){
                            reject(error);
                        } else {
                            reject("An error occured while accessing data")
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
                (error, results) => {
                    if (error) {
                        if(debug===1){
                            return res.status(500).send(error);
                        } else {
                            return res.status(500).send("An error occured while accessing the data")
                        }       
                    }
                    res.status(201).send(results);
                }
            );
        } catch (error) {
            if(debug===1){
                res.status(500).send(error);
            } else {
                res.status(500).send("An error occured while accessing the data");
            }
        }
    }
    else {
        // File type is not supported
        if (debug = 1)
            return res.status(400).send(error);
        else
            return res.status(400).send({ error: 'Invalid file type. Only JPEG, PNG, and JPG files are allowed.' });
    }
};

export const verifyLogin = async (req, res) => {
    const { email, password } = req.body;

    // Validate inputs
    if (!validateEmail(email)) { 
        if(debug===1){
            return res.status(400).send(error); 
        } else {
            return res.status(400).send({ error: 'Invalid email address' }); 
        }
    }

    try {
        if (isLocked[email] && Date.now() - lastLoginAttempt[email] < 60000) {
            const lockoutTime = Math.ceil((60000 - (Date.now() - lastLoginAttempt[email])) / 1000);
            if(debug===1){
                return res.status(401).send({
                    message: `Account is locked. Please try again after ${lockoutTime} seconds.`,
                    failedAttempts: failedAttempts[email],
                    isLocked: true
                });
            } else {
                return res.status(401).send({
                    message: `Account is temporarily suspended.`,
                    failedAttempts: failedAttempts[email],
                    isLocked: true
                });
            }
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
            if (error) {
                if(debug === 1){
                    return res.status(500).send(error);
                } else {
                    return res.status(500).send("An error occured while accessing the data");
                }
            } 
            
            if (results.length === 0) {
                if(debug===1){
                    return res.status(404).send('User does not exist');
                } else {
                    return res.status(404).send("Invalid Email Provided");
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
                    if(debug === 1){
                        return res.status(401).send({
                            message: `Account is locked. Please try again after ${lockoutTime} seconds.`,
                            failedAttempts: failedAttempts[email],
                            isLocked: true
                        });
                    } else {
                        return res.status(401).send({
                            message: `Account is temporarily suspended`,
                            failedAttempts: failedAttempts[email],
                            isLocked: true
                        });
                    }
                    
                } else {
                    if (debug === 1) {
                        return res.status(401).send({
                            message: 'Incorrect Password for Inputted Email',
                            failedAttempts: failedAttempts[email],
                            isLocked: false
                        });
                    } else {
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
        if(debug===1){
            res.status(500).send(error);
        } else {
            res.status(500).send("An error occured while accessing the data");
        }
    }
};

export const validate_session = async (req, res) => {
    const sessionId = req.cookies.sessionId;
    const ip = req.ipv4;

    try {
        // Check if the session ID matches the stored session ID
        if (sessionId === userSession.session && ip == userSession.IP) {
            const user = await getUserById(userSession.id);

            if (user) {
                res.setHeader('Set-Cookie', cookie.serialize('sessionId', sessionId, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict',
                    maxAge: 2 * 60, // 2 minutes
                    path: '/'
                }));
                console.log("NEW COOKIE TIMER");
                
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
                if(debug===1){
                    res.json({ authenticated: false, error: "Invalid Session ID" });
                } else {
                    res.json({ authenticated: false, error: "Disconnected from the server" });
                }
            }
            else if (ip !== userSession.IP) {
                if(debug===1){
                    res.json({ authenticated: false, error: "IP Address Mismatch" });
                } else {
                    res.json({ authenticated: false, error: "Disconnected from the server" });
                }
            }
        }
    } catch (error) {
        // Handle errors
        // console.error("Error validating session:", error);
        if(debug === 1){
            res.status(500).json({ authenticated: false, error});
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
