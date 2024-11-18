import mongoose from "mongoose";
import { sendResponse } from "../helpers/sendRes.js";
import { User } from "../models/user.model.js";

async function fetchUsers(req, res) {
    const { username } = req.query;
    try {
        const users = await User.find(
            {
                username: { $regex: `^${username}`, $options: 'i' },
                _id: { $ne: req._id }
            }
        );

        return sendResponse(res, 200, "User fetched", users);
    } catch (error) {
        console.log(error)
        return sendResponse(res, 500, "Error Fetching Users");
    }

}

async function fetchFriends(req, res) {
    const userId = req._id;

    try {
        const user = await User.findById(userId).populate('friends', 'username profilePic');

        if (!user) return sendResponse(res, 404, "User not found");


        return sendResponse(res, 200, "Friends", user.friends);
    } catch (err) {
        return sendResponse(res, 500, "Server Error");
    }
}

async function fetchUser(req, res) {
    const userId = req._id;
    const { username } = req.query;
    try {
        // Find the user by their username
        const targetUser = await User.findOne({ username });
        const currentUser = await User.findById(userId);
        console.log(currentUser);
        if (!targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the target user is in the current user's friend list
        const isFriend = targetUser.friends.includes(userId);
        if (isFriend) {
            return res.json({
                message: "Friend",
                status: "friend",
                profilePic: targetUser.profilePic,
                username: targetUser.username,
                selectedId: targetUser._id,
            });
        }
        // Check if a friend request was sent
        const isRequestSent = targetUser.friendRequests.includes(userId);
        if (isRequestSent) {
            return res.json({
                message: "Friend request sent Already",
                status: "requested",
                profilePic: targetUser.profilePic,
                selectedId: targetUser._id,
            });
        }

        // Check if the user is blocked
        const isBlocked = targetUser.blocked.includes(userId);
        if (isBlocked) {
            return res.json({
                message: "You have been blocked",
                status: "blocked",
                profilePic: 'https://via.placeholder.com/150',
                selectedId: targetUser._id,
            });
        }

        // Check if the current user has blocked the target user
        const isBlockedByCurrentUser = currentUser.blocked.includes(targetUser._id);
        if (isBlockedByCurrentUser) {
            return res.json({
                message: "You have blocked this user",
                status: "yBlocked",
                profilePic: 'https://via.placeholder.com/150', // Placeholder profile picture
                selectedId: targetUser._id,
            });
        }

        const receivedRequest = currentUser.friendRequests.includes(targetUser._id);
        if (receivedRequest) {
            return res.json({
                message: "You have a friend request",
                status: "recieved",
                profilePic: 'https://via.placeholder.com/150', // Placeholder profile picture
                selectedId: targetUser._id,
            });
        }


        // If no conditions met, return the default case (i.e., no friend request or block)
        return res.json({ message: "No request, not friends", status: "noRequest", profilePic: targetUser.profilePic,selectedId: targetUser._id, });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

export { fetchUsers, fetchFriends, fetchUser };