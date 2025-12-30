import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { getMyInfo,getMyInfo1 } from '../controllers/nhankhau.js';
import { handleGetHouseholdMembers } from '../controllers/qlnhankhau.js';
const router = express.Router();

router.get(
    '/getMyInfo', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    getMyInfo
);
router.get(
    '/getMyInfo1', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    getMyInfo1
);
router.get(
    '/getMember', 
    authenticateJWT, 
    authorizeRoles([2,3,4]), 
    handleGetHouseholdMembers
);
export default router;