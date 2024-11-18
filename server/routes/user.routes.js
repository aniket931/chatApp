import { Router } from "express";
import { fetchFriends, fetchUser, fetchUsers } from "../controllers/user.controller.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = Router();

router.get('/', isAuth, fetchUsers);
router.get('/friends', isAuth, fetchFriends);
router.get('/friend-status', isAuth, fetchUser);

export default router;