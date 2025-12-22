const express = require('express');
const router = express.Router();
const controller = require('../controllers/biendong_controller');
const { verifyToken, checkRole } = require('../middlewares/auth_middlewares');

// User routes
router.get('/my', verifyToken, controller.getMyBienDong);
router.get('/my-info', verifyToken, controller.getMyInfo);
router.post('/my', verifyToken, controller.createBienDong);
router.put('/my-status', verifyToken, controller.updateMyStatus);

// Admin routes
router.get('/', verifyToken, checkRole('SuperAdmin'), controller.getAllBienDong);

module.exports = router;
