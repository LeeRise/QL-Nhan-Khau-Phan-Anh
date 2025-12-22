const express = require('express');
const router = express.Router();
const controller = require('../controllers/phananh_controller');
const m = require('../middlewares/phananh_middlewares');
const { verifyToken, checkRole } = require("../middlewares/auth_middlewares");

// User routes
router.get('/my', verifyToken, controller.getMyReports);
router.post('/my', verifyToken, controller.createMyReport);

// Admin routes
router.get('/', verifyToken, checkRole("SuperAdmin"), controller.getAll);
router.get('/:id', verifyToken, checkRole("SuperAdmin"), controller.getOne);
router.post('/', verifyToken, checkRole("SuperAdmin"), m.validatePhanAnh, controller.create);
router.put('/:id', verifyToken, checkRole("SuperAdmin"), controller.update);
router.delete('/:id', verifyToken, checkRole("SuperAdmin"), controller.remove);
router.put('/:id/phan-hoi', verifyToken, checkRole("SuperAdmin"), m.checkPAExists, m.validatePhanHoi, controller.reply);

module.exports = router;
