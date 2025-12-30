import express from 'express';

import { 
    login as userLogin,
    changePassword,
    forgotPasswordStep1,
    forgotPasswordStep2,
    forgotPasswordStep3,
    forgotPasswordVerifyOTP,
    forgotPasswordFinalReset,
    getSessionInfo,
    logout

} from '../controllers/userC.js';

import { authenticateJWT } from '../middleware/authMiddleware.js';
import { 
    validateUserLoginData,
    validateMatKhauDoi,
    validateResetPasswordStep1,
    validateNhanKhauVerification,
    validateMatKhauQuen
} from '../middleware/validation.js';

const router = express.Router();

router.post(
    '/login',
    validateUserLoginData,
    userLogin
);

router.post(
    '/change-password',
    authenticateJWT,
    validateMatKhauDoi,
    changePassword
);

router.post(
    '/forgot-password/step1',
    validateResetPasswordStep1,
    forgotPasswordStep1
);

router.post(
    '/forgot-password/step2',
    validateNhanKhauVerification,
    forgotPasswordStep2
);

router.post(
    '/forgot-password/step3-send-otp',
    forgotPasswordStep3
);

router.post(
    '/forgot-password/step4-otp',
    forgotPasswordVerifyOTP
);
router.post(
    '/forgot-password/step5-final',
    validateMatKhauQuen,
    forgotPasswordFinalReset

)
router.post('/logout',logout);
router.get(
    '/session', 
    authenticateJWT, 
    getSessionInfo
);
export default router;
