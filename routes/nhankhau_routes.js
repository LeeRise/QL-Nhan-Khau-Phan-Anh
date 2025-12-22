const express = require('express');
const router = express.Router();
const controller = require('../controllers/nhankhau_controller');
const m = require('../middlewares/nhankhau_middlewares');
const { verifyToken, checkRole, checkOwnerOrAdmin } = require("../middlewares/auth_middlewares");

// Routes cơ bản - Admin thấy tất cả, User chỉ thấy của mình
router.get('/', verifyToken, controller.getAll); // Đã có logic phân quyền trong controller
router.get('/:id', verifyToken, controller.getOne); // Đã có logic phân quyền trong controller
router.post('/', verifyToken, checkRole("SuperAdmin"), controller.create);
router.put('/:id', verifyToken, checkOwnerOrAdmin, controller.update); // User có thể sửa thông tin của mình
router.delete('/:id', verifyToken, checkOwnerOrAdmin, controller.remove); // User có thể xóa thông tin của mình

// A1 — Thêm trẻ sơ sinh
router.post('/tre-sinh', verifyToken, checkRole("SuperAdmin"), m.validateNewBorn, m.checkHKExists, controller.addNewBorn);

// A2 — Chuyển hộ khẩu
router.put('/chuyen-ho-khau/:id', verifyToken, checkRole("SuperAdmin"), m.checkNKExists, m.checkHKExists, controller.changeHousehold);

// A3 — Đổi trạng thái
router.put('/doi-trang-thai/:id', verifyToken, checkRole("SuperAdmin"), m.checkNKExists, m.validateTrangThai, controller.changeStatus);

// A4 — Ghi biến động thủ công
router.post('/bien-dong', verifyToken, checkRole("SuperAdmin"), m.checkNKExists, controller.addBienDong);
    
module.exports = router;
