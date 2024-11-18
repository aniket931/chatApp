import { Server } from 'socket.io';
import http from 'http';
import dotenv from 'dotenv';
import app from './app/app.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import friendRoutes from './routes/friend.routes.js';
import messageRoutes from './routes/messages.routes.js';
import { User } from './models/user.model.js';
import { Conversations } from './models/message.model.js';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from 'cloudinary';


dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'uploads', // Cloudinary folder for your files
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage });

const PORT = process.env.PORT;
const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// File upload endpoint
app.post('/upload', upload.array('files'), (req, res) => {
  const fileUrls = req.files.map(file => file.path); // Get Cloudinary URLs
  console.log('Files uploaded:', fileUrls);
  res.json({ files: fileUrls });
});

io.on('connection', (socket) => {
  console.log("A user is connected", socket.id);

  socket.on('register', async (userId) => {
    await User.findByIdAndUpdate(userId, { socketId: socket.id });
  });

  // Handle message with files
  socket.on('sendMessageWithFiles', (messageData) => {
    console.log('Received message with files:', messageData);

    // Broadcast the message to the receiver
    socket.to(messageData.receiver).emit('newMessage', messageData);
  });

  socket.on('sendMessage', async ({ sender, receiver, content, files, tempId }) => {
    try {
      const message = new Conversations({
        sender,
        receiver,
        content,
        files,
        sent: true,
      });

      const savedMessage = await message.save();
      socket.emit('messageSent', { ...savedMessage._doc, tempId });

      const receiverUser = await User.findById(receiver);
      if (receiverUser?.socketId) {
        console.log('other user is online');
        const updatedMsg = await Conversations.findById(savedMessage._id);
        updatedMsg.read = true;
        await updatedMsg.save();

        // Emit to receiver with updated read status and media
        io.to(receiverUser.socketId).emit('receiveMessage', updatedMsg);

        // Notify the sender that the message has been read
        socket.emit('update_doubletick', { messageId: updatedMsg._id });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });


  socket.on('messageRead', async ({ sender, receiver, messageId }) => {
    try {
      // Find the message by its ID and update the read status
      const message = await Conversations.findById(messageId);
      if (message) {
        message.read = true;
        await message.save();

        // Find the sender's user details (e.g., socketId) to notify them
        const senderUser = await User.findById(sender);
        if (senderUser?.socketId) {
          // Emit an event to the sender's client with the message ID and updated status
          console.log("sending message read");
          io.to(senderUser.socketId).emit('messageReadUpdate', { messageId, read: true });
        }
      }
    } catch (error) {
      console.error("Error updating message read status:", error);
    }
  });


  socket.on('messagesRead', async ({ sender, receiver }) => {
    // Mark all unread messages from otherUserId to userId as read
    const updatedMessages = await Conversations.find({ sender, receiver, read: false })
      .updateMany({ read: true })
      .exec();



  });

  socket.on('video-call', async (data) => {
    const { to, from, offer } = data;
    console.log("offer:", offer);
    const user = await User.findById(from);
    const receiver = await User.findOne({ username: to });
    // Notify the recipient of the incoming call
    if (receiver.socketId) {
      io.to(receiver.socketId).emit('incoming-video-call', {
        from: user.username,
        to: receiver.username
        , fromId: user.socketId,
        offer: offer
      });
    }
  });

  // Join room after accepting the call
  socket.on('join-video-room', (data) => {
    const { room, from, to, fromId, ans } = data;
    console.log("ans", ans);
    socket.join(room);
    io.to(fromId).emit('user-joined', { room, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });



  socket.on('disconnect', async () => {
    await User.findOneAndUpdate({ socketId: socket.id }, { socketId: null });
  });

});



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});