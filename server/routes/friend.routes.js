import { Router } from 'express';
import { acceptFriendRequest, blockUser, cancelFriendRequest, rejectFriendRequest, removeFriend, sendFriendRequest, unblockUser } from '../controllers/friend.controller.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = Router();

router.post('/send-request', isAuth, sendFriendRequest);
router.post('/accept-request', isAuth, acceptFriendRequest);
router.post('/reject-request', isAuth, rejectFriendRequest);
router.post('/block-user', isAuth, blockUser);
router.post('/remove-friend', isAuth, removeFriend);
router.post('/unblock-user', isAuth, unblockUser);
router.post('/cancel-request', isAuth, cancelFriendRequest);

export default router;