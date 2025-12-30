import express from 'express';
import { authenticateJWT, authorizeRoles } from '../middleware/authMiddleware.js';
import {
    handleGetHouseholdMembers,
    handleSplitHousehold,
    handleMoveEntireHousehold,
    handleRegisterNewHousehold,
    handleRegisterResidence,
    handleGetDemographicStats,
    handleGetResidenceStats,
    handleGetHouseholdHistory,
    handleAddMember,
    handleMemberDepartureController,
    handleUpdatePersonInfo,
    handleGetChildrenCount,
    handleCheckMemberStatus
} from '../controllers/qlnhankhau.js'
import { handleCheckMemberForAdd } from '../controllers/qlnhankhau.js';
const router = express.Router();
//đâng ký hộ khẩu/ tách hộ/chuyển đi cả hộ/lịch sử thay đổi hộ
router.post('/household/register', 
    authenticateJWT,
    authorizeRoles([2,3,4]),
    handleRegisterNewHousehold);
router.post('/household/split',
    authenticateJWT,
    authorizeRoles([2,3,4]),
    handleSplitHousehold);
router.get('/household/members', 
    authenticateJWT,
    authorizeRoles([2,3,4]),
    handleGetHouseholdMembers);
router.get('/household/history/:maHK',
    authenticateJWT,
    authorizeRoles([2,3,4,5,6]),
    handleGetHouseholdHistory);
router.post('/household/move-entire',
    authenticateJWT,
    authorizeRoles([2,3,4]), 
    handleMoveEntireHousehold);
//thêm tv/thay đổi thông tin thành viên/nhân khẩu chuyển đi/tạm trú tạm vắng//check cccd/kiểm tra ch tt và tv
router.post('/member/add', 
    authenticateJWT,
    authorizeRoles([2,3,4]),
    handleAddMember);
router.put('/member/update', 
    authenticateJWT,
    authorizeRoles([2,3,4]),
    handleUpdatePersonInfo);    
router.post('/member/departure', 
    authenticateJWT,
    authorizeRoles([2,3,4]), 
    handleMemberDepartureController);
router.post('/member/residence-change', 
    authenticateJWT,
    authorizeRoles([2,3,4]),  
    handleRegisterResidence);
router.get('/member/check', 
    authenticateJWT,
    authorizeRoles([2,3,4]), 
    handleCheckMemberForAdd);
router.get('/member/check-status', 
    authenticateJWT,
    authorizeRoles([2,3,4]), 
    handleCheckMemberStatus);
// thống kê
router.get('/stats/demographic', 
    authenticateJWT,
    authorizeRoles([2,3,4]), 
    handleGetDemographicStats);
router.get('/stats/residence-fluctuation',
    authenticateJWT,
    authorizeRoles([2,3,4]), 
    handleGetResidenceStats);
router.get('/stats/children-count',
    authenticateJWT,
    authorizeRoles([2,3,4,5,6]),  
    handleGetChildrenCount);
export default router;