import express from 'express';
import multer from 'multer';
import path from 'path';
import { saveAccount, showUsers, verifyLogin, validate_session, removeSessionCookie, fetchImage } from '../controllers/user.js';

const router = express.Router();


const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null, path.dirname('../FE/src/assets/user-image/./'))
    },

    filename:function(req,file,cb){
        const filename = file.originalname;
        cb(null,Date.now() + '-' + filename);
    }
});

const upload = multer({
    storage:storage,
    limits: {fileSize: 1000000},
    fileFilter: (req,file,cb) => {
        if(file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/png"){
            cb(null,true);
        } else{
            cb(null, false);
            return cb(new Error('Only jpg, jpeg and png are allowed.'))
        }
    }
});

router.get("/users/showUsers", showUsers);
router.post("/users/saveAccount", upload.single('profilePicture'), saveAccount);
router.post("/users/verifyLogin", upload.none(), verifyLogin);
router.post("/users/validate_session", upload.none(), validate_session);
router.post("/users/removeCookie", upload.none(), removeSessionCookie);
router.get('/users/photo', fetchImage)

export default router;