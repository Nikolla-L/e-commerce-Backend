import express from 'express';
import AuthController from "../controllers/AuthController";

const router = express.Router({ mergeParams : true });

router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.post('/register', AuthController.register)
router.put('/update', AuthController.updateUser)
router.get('/list', AuthController.getAllUsers)
router.post('/forgot-password', AuthController.sendMail)
router.put('/reset-password', AuthController.checkCode, AuthController.resetPassword)
router.post('/google-auth', AuthController.googleAuth)

export default router;