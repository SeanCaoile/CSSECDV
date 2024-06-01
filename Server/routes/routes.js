import express from 'express';
import multer from 'multer';
import { saveAccount, showUsers, verifyLogin } from '../controllers/user.js';

const router = express.Router();
const upload = multer();

router.get("/users/showUsers", showUsers);
router.post("/users/saveAccount", upload.none(), saveAccount);
router.post("/users/verifyLogin", upload.none(), verifyLogin);
export default router;