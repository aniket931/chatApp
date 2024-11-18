import { Router } from "express";
import { login, logout, otpSend, register, verify} from "../controllers/auth.controller.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify/:_id', verify);
router.post('/resend-otp/:_id', otpSend);



export default router;