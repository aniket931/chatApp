import { sendResponse } from "../helpers/sendRes.js";
import { io } from "../index.js";
import { User } from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
    const { username } = req.body;
    const senderId = req._id;

    try {

        const reciever = await User.findOne({ username });
        const sender = await User.findById(senderId);
        if (reciever._id == senderId) {
            return sendResponse(res, 400, "Cant send Request to yourself");
        }

        if (!reciever) {
            return sendResponse(res, 404, "User not found");
        }

        if (reciever.blocked.includes(senderId)) {
            return sendResponse(res, 403, "U have been blocked");
        }
        if (reciever.friendRequests.includes(senderId)) {
            return sendResponse(res, 400, "Friend Request send already");
        }
        reciever.friendRequests.push(senderId);
        await reciever.save();

        if (reciever.socketId) {
            io.to(reciever.socketId).emit('recieve_request', {
                username: sender.username,
                length: reciever.friendRequests.length,
            });
        }


        return sendResponse(res, 200, "Friend Request sent successfully");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, 'Server Error');
    }
};

export const acceptFriendRequest = async (req, res) => {
    const { username } = req.body;
    const receiverId = req._id;
    try {
        const reciever = await User.findById(receiverId); //Aniket
        const sender = await User.findOne({ username }); //test

        if (!reciever || !sender) return sendResponse(res, 404, "user not found");


        if (!reciever.friendRequests.includes(sender._id)) {
            return sendResponse(res, 400, "Friend Request not found");
        }

        reciever.friends.push(sender._id);
        reciever.friendRequests = reciever.friendRequests.filter(id => id.toString() === sender._id);
        await reciever.save();

        sender.friends.push(receiverId);
        await sender.save();
        // event listener to be applied on test
        if (sender.socketId) {
            io.to(sender.socketId).emit('accept_request', {
                username: reciever.username, //Aniket
                length: reciever.friendRequests.length,
            });
        }
        io.to(reciever.socketId).emit('accept_request',{});


        return sendResponse(res, 200, "Accepted Friend Request");

    } catch (err) {
        return sendResponse(res, 500, "Server Error");
    }
};

export const rejectFriendRequest = async (req, res) => {
    const userId = req._id;
    const { username } = req.body;

    try {
        const target = await User.findOne({ username });
        const user = await User.findById(userId);
        console.log(user, target, "line 85");
        target.friendRequests = target.friendRequests.filter(id => id.toString() != sender._id);
        await target.save();

        if (target.socketId) {
            io.to(target.socketId).emit('reject_request', {
                username: user.username,
                length: user.friendRequests.length,
            });
        }

        return sendResponse(res, 200, "Rejected Request");

    } catch (err) {
        return sendResponse(res, 500, "server error");
    }
}

// Block a user
export const blockUser = async (req, res) => {
    const userId = req._id;
    const { username } = req.body;

    try {
        const user = await User.findById(userId); //test
        const target = await User.findOne({ username }); //Aniket
        // Check if the user is already blocked
        if (user.blocked.includes(target._id)) {
            return sendResponse(res, 400, "User already blocked");
        }

        // Remove the target user from friends and friendRequests if present
        user.friends = user.friends.filter(id => id.toString() != target._id);
        user.friendRequests = user.friendRequests.filter(id => id.toString() != target._id);
        target.friends = target.friends.filter(id => id.toString() != userId);

        // Add to blocked list
        user.blocked.push(target._id);
        await user.save();
        await target.save();

        if (target.socketId) { 
            io.to(target.socketId).emit('blocked_me', {
                username: user.username,
                length: target.friendRequests.length,
            });
        }

        return sendResponse(res, 200, "User blocked successfully");
    } catch (error) {
        return sendResponse(res, 500, "Error blocking user", error);
    }
};

// Remove a friend
export const removeFriend = async (req, res) => {
    const userId = req._id;
    const { username } = req.body;

    try {
        const user = await User.findById(userId); //test 
        const friend = await User.findOne({ username }); //Aniket

        if (!user || !friend) {
            return sendResponse(res, 404, "User not found");
        }

        // Check if the friend is indeed in the user's friend list
        if (!user.friends.includes(friend._id)) {
            return sendResponse(res, 400, "User is not your friend");
        }


        // Remove each user from the other's friends list
        user.friends = user.friends.filter(id => id.toString() != friend._id);
        await user.save();

        friend.friends = friend.friends.filter(id => id.toString() !== userId);
        await friend.save();

        if (friend.socketId) {
            io.to(friend.socketId).emit('removed_me', {
                username: user.username,
                length: user.friendRequests.length,
            });
        }

        return sendResponse(res, 200, "Friend removed successfully");
    } catch (error) {
        return sendResponse(res, 500, "Error removing friend", error);
    }
};

export const cancelFriendRequest = async (req, res) => {
    try {
        const { username } = req.body;  // Target user's ID to cancel request to

        // Ensure targetUserId is provided
        if (!username) {
            return res.status(400).json({ message: "Target user ID is required." });
        }

        // Find the current user (request sender)
        const user = await User.findById(req._id);  // Get the logged-in user

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }



        // Check if the target user exists
        const targetUser = await User.findOne({ username });

        if (!targetUser) {
            return res.status(404).json({ message: "Target user not found." });
        }


        // Remove the current user from the target user's friendRequests array
        targetUser.friendRequests = targetUser.friendRequests.filter(request => !request.equals(user._id));

        // Save both users
        await user.save();
        await targetUser.save();
        console.log("user:", user, targetUser.username);
        if (targetUser.socketId) {
            io.to(targetUser.socketId).emit('cancelled_request', {
                username: user.username,
                length: user.friendRequests.length,
            });
        }

        return res.status(200).json({ message: "Friend request cancelled successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error while cancelling friend request." });
    }
};

export const unblockUser = async (req, res) => {
    const userId = req._id;
    const { username } = req.body;

    try {
        // Find the current user and target user
        const user = await User.findById(userId);
        const target = await User.findOne({ username });

        // Check if the target user exists
        if (!user || !target) {
            return sendResponse(res, 404, "User or target not found");
        }

        // Check if the user is blocked
        if (!user.blocked.includes(target._id)) {
            return sendResponse(res, 400, "User is not blocked");
        }

        // Remove the target user from the blocked list
        user.blocked = user.blocked.filter(id => id.toString() !== target._id.toString());


        // Save both users
        await user.save();
        await target.save();

        if (target.socketId) {
            io.to(target.socketId).emit('unblocked_me', {
                username: user.username,
                length: user.friendRequests.length,
            });
        }

        return sendResponse(res, 200, "User unblocked successfully");
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "Error unblocking user");
    }
};