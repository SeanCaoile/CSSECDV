import express from 'express';

import { saveAccount, showUsers, verifyPassword } from '../controllers/user.js';

const router = express.Router();

router.get("/users/showUsers", showUsers);
router.post("/users/saveAccount", saveAccount);
router.post("/users/verifyPassword", verifyPassword);
export default router;