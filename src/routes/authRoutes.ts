import express from 'express';
import AuthController from "../controllers/AuthController";

const router = express.Router({ mergeParams : true });

router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)
router.post('/register', AuthController.register)
router.put('/update', AuthController.updateUser)
router.get('/list', AuthController.getAllUsers)

export default router;