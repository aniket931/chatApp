import { Router } from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getMessages, sendMessage } from "../controllers/messages.controller.js";

const router = Router();

router.get('/get',isAuth ,getMessages);
router.post('/', isAuth, sendMessage);

export default router;