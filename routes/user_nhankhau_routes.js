const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_nhankhau_controller');
const { verifyToken } = require('../middlewares/auth_middlewares');

// User routes
router.get('/check', verifyToken, controller.checkMyNhanKhau);
router.post('/update', verifyToken, controller.updateMyNhanKhau);

module.exports = router;
