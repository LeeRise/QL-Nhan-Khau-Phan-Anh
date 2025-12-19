const express = require('express');
const router = express.Router();
const controller = require('../controllers/phananh_controller');
const m = require('../middlewares/phananh_middlewares');
const { verifyToken, checkRole } = require("../middlewares/auth_middlewares");

router.post(
  '/',
  verifyToken,
  m.validatePhanAnh,
  controller.create
);

router.get(
  '/my',
  verifyToken,
  controller.getMyReports
);

router.get(
  '/',
  verifyToken,
  checkRole("SuperAdmin"),
  controller.getAll
);

router.put(
  '/:id/phan-hoi',
  verifyToken,
  checkRole("SuperAdmin"),
  m.checkPAExists,
  m.validatePhanHoi,
  controller.reply
);

module.exports = router;
