import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectDb = async() => {
    try{
        await mongoose.connect('mongodb://localhost:27017/database');
        console.log("Connected to DB successfully");
    }
    catch(error){
        console.error(error);
        process.exit(1);
    }
}