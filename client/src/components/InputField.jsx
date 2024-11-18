import React, { useEffect, useRef, useState } from 'react';
import { Image, Microphone, Smiley } from '@phosphor-icons/react';
import { useUser } from '../contexts/AppContext.jsx';
import EmojiPicker from 'emoji-picker-react';
import socket from '../contexts/socket.js';
import axios from './axiosConfig.js';
import { v4 as uuidv4 } from 'uuid';


const InputField = ({ handleFileChange, setMessage, selectedId, files, setFiles }) => {
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const userId = localStorage.getItem('token');

    const { iconSize } = useUser();
    const fileInputRef = useRef(null); // Ref for file input

    const handleEmojiClick = (emojiObject) => {
        setNewMessage((prev) => prev + emojiObject.emoji);
    };
    const handleInputChange = (e) => setNewMessage(e.target.value);

    const sendMessage = async () => {

        if (!newMessage.trim() && files.length === 0) return;
        const tempId = uuidv4();
        const messageData = {
            sender: userId,
            receiver: selectedId,
            content: newMessage,
            sent: false,
            files: [],
            tempId
        };

        if (files.length !== 0) {
            const formData = new FormData();
            console.log(files);
            files.forEach(file => formData.append('files', file));
            try {

                // Upload files to the server
                const uploadResponse = await axios.post('http://localhost:5000/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                // After the upload is complete, send the message with file paths
                const uploadedFiles = uploadResponse.data.files; // Assume server returns file URLs
                console.log("Uploaded Files from server:", uploadedFiles);

                // Ensure that files are independently copied to avoid reference issues
                messageData.files = [...uploadedFiles];  // Create a new array to avoid reference issues
                console.log("Message data after adding uploaded files:", messageData);

            } catch (error) {
                console.log(error);
            }
        }

        socket.emit('sendMessage', { ...messageData });

        // Log the message data just before state update
        console.log("Sending message data to state:", messageData);

        // Update the state with the newly created message
        setMessage((prevMessages) => {
            const updatedMessages = [
                ...prevMessages,
                { ...messageData, files: JSON.parse(JSON.stringify(messageData.files)) },
            ];
            console.log("Updated messages after adding new message:", updatedMessages); // Check how state is being updated
            return updatedMessages;
        });
        setNewMessage('');
        setFiles([]);
        return;
    };

    return (

        <div className="flex items-center p-3 bg-white border-t mb-8 md:mb-0 ">
            <button className="text-gray-500 hover:text-icongreen mr-1">
                <Microphone size={iconSize} />
            </button>
            <button onClick={() => fileInputRef.current.click()}
                className="text-gray-500 hover:text-icongreen mr-1">
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} style={{ display: 'none' }} />
                <Image size={iconSize} />
            </button>
            <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-icongreen"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            {/* Emoji Picker Toggle Button */}
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-gray-500 hover:text-icongreen ml-1">
                <Smiley size={iconSize} />
            </button>

            {showEmojiPicker && (
                <div className="absolute bottom-14 right-0">
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

        </div>
    )
};

export { InputField }