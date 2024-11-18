import { Conversations } from "../models/message.model.js";

export const getMessages = async (req, res) => {
    const userId = req._id;
    const { otherUserId } = req.query;
    
    const messages = await Conversations.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort('timestamp');
    res.json(messages);
  };

  export const sendMessage = async (req, res) => {
    const userId = req._id;
    const { otherUserId, content } = req.body;
    const newMessage = new Conversations({sender: userId, receiver: otherUserId, content });
    await newMessage.save();

    return res.status(200).json({message: "chat sent"});
  };
  
  
