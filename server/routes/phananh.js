import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import { submitPhanAnh, getAllSummary, getDetail, getMyHistory,handleSearchPhanAnh,handleUpdateStatus,handleDeletePhanAnh,handleGetPhanAnhStatistics,getNotifications,markAsRead } from '../controllers/phananh.js';
const router = express.Router();


router.post(
    '/create', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    submitPhanAnh
);
router.get(
    '/allSummary', 
    authenticateJWT, 
    authorizeRoles([2,3,5]), 
    getAllSummary
);
router.get(
    '/detail/:maPA', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    getDetail
);
router.get(
    '/getMyHistory', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    getMyHistory
);
router.post(
    '/Phanhoi', 
    authenticateJWT, 
    authorizeRoles([2,3,5]), 
    handleUpdateStatus
);
router.get(
    '/searchPhanAnh', 
    authenticateJWT, 
    authorizeRoles([2,3,5]), 
    handleSearchPhanAnh
);
router.delete(
    '/delete/:maPA', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    handleDeletePhanAnh
);
router.get(
    '/getPAstatics',
    authenticateJWT,
    authorizeRoles([2,3,5]),
    handleGetPhanAnhStatistics

)
router.get('/:cccd', 
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    getNotifications);

router.put('/read/:id',
    authenticateJWT, 
    authorizeRoles([2,3,4,5,6]), 
    markAsRead);
export default router;