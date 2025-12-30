import express from 'express';
import { adminLogin,logout,getSessionInfo1 } from '../controllers/userC.js'; 
import { validateAdminLoginData } from '../middleware/validation.js';
import { authenticateJWT } from '../middleware/authMiddleware.js';

const router = express.Router();


router.post(
    '/login', 
    validateAdminLoginData, 
    adminLogin 
);
router.post('/logout',logout);
router.get(
    '/session', 
    authenticateJWT, 
    getSessionInfo1
);
export default router;