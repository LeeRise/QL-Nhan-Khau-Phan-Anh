const express = require('express');
const router = express.Router();
const controller = require('../controllers/nhankhau_controller');
const m = require('../middlewares/nhankhau_middlewares');
const { verifyToken, checkRole } = require("../middlewares/auth_middlewares");

// Routes cơ bản 
router.get('/', verifyToken, checkRole("SuperAdmin"), controller.getAll);
router.get('/:id', verifyToken, checkRole("SuperAdmin"), controller.getOne);
router.post('/', verifyToken, checkRole("SuperAdmin"), controller.create);
router.put('/:id', verifyToken, checkRole("SuperAdmin"), controller.update);
router.delete('/:id', verifyToken, checkRole("SuperAdmin"), controller.remove);

// A1 — Thêm trẻ sơ sinh
router.post('/tre-sinh', verifyToken, checkRole("SuperAdmin"), m.validateNewBorn, m.checkHKExists, controller.addNewBorn);

// A2 — Chuyển hộ khẩu
router.put('/chuyen-ho-khau/:id', verifyToken, checkRole("SuperAdmin"), m.checkNKExists, m.checkHKExists, controller.changeHousehold);

// A3 — Đổi trạng thái
router.put('/doi-trang-thai/:id', verifyToken, checkRole("SuperAdmin"), m.checkNKExists, m.validateTrangThai, controller.changeStatus);

// A4 — Ghi biến động thủ công
router.post('/bien-dong', verifyToken, checkRole("SuperAdmin"), m.checkNKExists, controller.addBienDong);

module.exports = router;
