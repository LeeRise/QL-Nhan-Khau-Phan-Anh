const express = require('express');
const router = express.Router();
const controller = require('../controllers/hokhau_controller');
const m = require('../middlewares/hokhau_middlewares');
const { verifyToken, checkRole } = require("../middlewares/auth_middlewares");

router.get(
  '/',
  verifyToken,
  checkRole("SuperAdmin"),
  controller.getAll
);

router.post(
  '/',
  verifyToken,
  checkRole("SuperAdmin"),
  m.validateHoKhau,
  controller.create
);

router.put(
  '/:id',
  verifyToken,
  checkRole("SuperAdmin"),
  m.checkHKExists,
  m.validateHoKhau,
  controller.update
);

router.delete(
  '/:id',
  verifyToken,
  checkRole("SuperAdmin"),
  m.checkHKExists,
  controller.remove
);

module.exports = router;
