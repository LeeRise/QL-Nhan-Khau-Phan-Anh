
import express from 'express';
import { assignRole, removeRole,searchNhanKhauC,getCanBoList } from '../controllers/adminC.js'; 


import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { validateAssignRoleData } from '../middleware/validation.js';

const router = express.Router();

router.post(
    '/assign-role', 
    authenticateJWT, 
    authorizeRoles([1]), 
    validateAssignRoleData,
    assignRole
);

router.post(
    '/remove-role', 
    authenticateJWT, 
    authorizeRoles([1]), 
    validateAssignRoleData, 
    removeRole
);
router.get(
    '/search-nhan-khau', 
    authenticateJWT, 
    authorizeRoles([1, 2, 3, 4, 5]), 
    searchNhanKhauC
);
router.get(
    '/can-bo-list', 
    authenticateJWT, 
    authorizeRoles([1]), 
    getCanBoList
);
export default router;

//authorizeRoles là hàm để chặn truy cập theo vai trò của họ