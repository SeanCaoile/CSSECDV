import express from 'express';

import { saveAccount, showUsers, verifyPassword } from '../controllers/user.js';

const router = express.Router();

router.get("/user/showUser", showUsers);
router.post("/user/saveAccount", saveAccount);
router.post("/user/verifyPassword", verifyPassword);
export default router;