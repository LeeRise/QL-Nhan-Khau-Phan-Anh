const express = require('express');
const router = express.Router();
const controller = require('../controllers/nhankhau_controller');
const m = require('../middlewares/nhankhau_middlewares');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

// A1 — Thêm trẻ sơ sinh
router.post('/tre-sinh', m.validateNewBorn, m.checkHKExists, controller.addNewBorn);

// A2 — Chuyển hộ khẩu
router.put('/chuyen-ho-khau/:id', m.checkNKExists, m.checkHKExists, controller.changeHousehold);

// A3 — Đổi trạng thái
router.put('/doi-trang-thai/:id', m.checkNKExists, m.validateTrangThai, controller.changeStatus);

// A4 — Ghi biến động thủ công
router.post('/bien-dong', m.checkNKExists, controller.addBienDong);

module.exports = router;
