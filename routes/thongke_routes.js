const express = require('express');
const router = express.Router();
const thongkeController = require('../controllers/thongke_controller');
const { verifyToken, checkRole } = require('../middlewares/auth_middlewares');

/**
 * Các route này thường chỉ dành cho Admin (SuperAdmin) 
 * hoặc các vai trò quản lý như Tổ trưởng/Tổ phó.
 */

// Route lấy thống kê tổng quan (số lượng nhân khẩu, hộ khẩu, phản ánh mới)
router.get(
    '/tong-quan', 
    verifyToken, 
    checkRole('SuperAdmin'), 
    thongkeController.getGeneralStats
);

// Route lấy thống kê chi tiết phản ánh (Phân loại theo An ninh, Môi trường, Xã hội)
// Đáp ứng yêu cầu: Ai phản ánh, loại phản ánh, trạng thái và tổng số lượng từng loại.
router.get(
    '/phan-anh-chi-tiet', 
    verifyToken, 
    checkRole('SuperAdmin'), 
    thongkeController.getDetailedStats
);

module.exports = router;