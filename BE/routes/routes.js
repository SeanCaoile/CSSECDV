import express from 'express';
import multer from 'multer';
import { saveAccount, showUsers, verifyLogin, validate_session, removeSessionCookie } from '../controllers/user.js';

const router = express.Router();
const upload = multer();

router.get("/users/showUsers", showUsers);
router.post("/users/saveAccount", upload.none(), saveAccount);
router.post("/users/verifyLogin", upload.none(), verifyLogin);
router.post("/users/validate_session", upload.none(), validate_session);
router.post("/users/removeCookie", upload.none(), removeSessionCookie);

export default router;