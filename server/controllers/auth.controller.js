import { hashedPass, verifyPassword } from "../helpers/hashPass.js";
import { sendResponse } from "../helpers/sendRes.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';


async function register(req, res) {

    try {
        const { username, email, password } = req.body;
        const existingEmail = await User.findOne({ email });


        if (existingEmail) {
            return sendResponse(res, 409, 'Email Already in Use');
        }

        const existingUsername = await User.findOne({ username });

        if (existingUsername) {
            return sendResponse(res, 400, 'Username Already Taken');
        }

        const hashed = await hashedPass(password);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const user = await User.create({ username, email, password: hashed, otp, otpExpires: Date.now() + 5 * 60 * 1000 });

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "OTP Verification",
            text: `Your OTP is ${otp}`,
        });

        return sendResponse(res, 201, "OTP sent to Email", user._id);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

async function verify(req, res) {
    const { otp } = req.body;

    const { _id } = req.params;

    try {
        const user = await User.findOne({ _id });

        if (!user) return sendResponse(res, 404, "User not found");
        if (user.otpExpires < Date.now()) return sendResponse(res, 400, "OTP Expired");
        if (user.otp !== otp) return sendResponse(res, 400, "OTP Invalid");

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        return res.cookie('token', token, { httpOnly: 'true', sameSite: 'lax' }).json({
            message: 'OTP Verified',
            user
        });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, "Some Error occured while verifying OTP");
    }
};

async function login(req, res) {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return sendResponse(res, 404, 'No user found');
        }

        const isMatch = await verifyPassword(password, user.password);
        if (!isMatch) return sendResponse(res, 400, 'Invalid Credentials');

        if (!user.isVerified) {
            return sendResponse(res, 200, "Verify Otp", { isVerified: false, id: user._id });
        };

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

        return res.cookie('token', token, {
            maxAge: 100 * 365 * 24 * 3600 * 1000
            , httpOnly: 'true',
            sameSite: 'lax'
        }).json({
            message: 'Logged In successfully',
            data: user
        });
    } catch (error) {
        console.error(error);
        return sendResponse(res, 500, 'Server Error');
    }
};

async function otpSend(req, res) {
    const { _id } = req.params;
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        const user = await User.findById(_id);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "User is already verified" });

        // Generate a new OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOtp;
        user.otpExpires = Date.now() + 300000; // Set expiration time to 5 minutes from now
        await user.save();

        // Send OTP via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: "Your New OTP Code",
            text: `Your new OTP is ${newOtp}`,
        });

        return sendResponse(res, 200, "OTP send successfully");
    } catch (err) {
        return sendResponse(res, 500, "Server Error");
    }
};


async function logout(req, res) {
    res.clearCookie('token').json({ message: 'Logged Out successfully' });
}

export { register, login, logout, verify, otpSend };