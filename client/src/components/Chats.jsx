import React, {  useEffect, useRef, useState } from 'react'
import axios from './axiosConfig.js';
import socket from '../contexts/socket.js';
import { InputField } from './InputField.jsx';

const Chats = React.memo(({ selectedId }) => {

  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState([]);
  const userId = localStorage.getItem('token');

    useEffect(() => {
    if (!selectedId) return;
    const loadMessages = async () => {
      try {
        const res = await axios.get('/messages/get', { params: { otherUserId: selectedId } });
        setMessage(res.data);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };
    loadMessages();

    const handleReceiveMessage = (data) => {
      console.log('Mesage recieved', data);
      setMessage((prevMessages) => [...prevMessages, data]);
      console.log("About to send read updates");
      socket.emit('messageRead', { sender: data.sender, receiver: data.receiver, messageId: data._id });
    };



    const handleUpdateTick = ({ messageId }) => {
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, sent: true } : msg
        )
      );
    };

    const handleUpdateRead = ({ messageId }) => {
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    };

    const handleMessageSent = (savedMessage) => {
      setMessage((prevMessages) =>
        prevMessages.map((msg) =>
          msg.tempId === savedMessage.tempId // Match using the temporary ID
            ? { ...savedMessage, sent: true, read: false } // Replace with the saved message
            : msg
        )
      );
    };

    socket.on('receiveMessage', handleReceiveMessage);
    socket.on('update_doubletick', handleUpdateTick);
    socket.on('messageSent', handleMessageSent);
    socket.on('messageReadUpdate', handleUpdateRead);



    return () => {
      console.log("all events logged out");
      socket.off('receiveMessage');
      socket.off('messageRead');
      socket.off('messageSent');
      socket.off('update_doubletick');
      socket.off('messageReadUpdate');

    }


  }, [selectedId]);

  // Mark messages as read when opening the chat
  useEffect(() => {
    if (selectedId) {
      socket.emit('messagesRead', { sender: selectedId, receiver: userId });
    
    }
    return () => {
      socket.off("messagesRead");
     
    }
  }, [selectedId]);

  // Scroll to the bottom when `message` changes
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [message]);

  // Ref for the message list bottom
  const messageEndRef = useRef(null);
  const dropAreaRef = useRef(null); // Ref for the drag-and-drop area

  // Handle drag over event (prevents default to allow drop)
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  // Handle file drop
  const handleDrop = (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    setFiles([...droppedFiles]);
  };

  const handleFileChange = (e) => {
    // Ensure files is an array
    const selectedFiles = Array.from(e.target.files); // Convert FileList to array
    setFiles(selectedFiles); // Set files state to array of file objects
  };



  return (
    <div className="flex flex-col h-full w-full border rounded-lg overflow-hidden shadow-lg">
      {/* Chat Box */}
      <div
        ref={dropAreaRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 no-scrollbar ">
        <div className='flex flex-col'>
          {message.map((msg, index) => (
            <div
              key={index}
              className={`p-3 my-2 rounded-lg max-w-xs ${msg.receiver === selectedId
                ? 'bg-icongreen text-white self-end '
                : 'bg-gray-200 text-gray-800 self-start  '
                }`}
            >
              {
                console.log(msg,index)
              }
              {/* Display files if they exist */}
              {msg.files?.length > 0 && (
                <div className="flex flex-wrap gap-4 mt-2">
                { 
                
                msg.files.map((file, index) => {
                  
                  const fileExtension = file.split('.').pop().toLowerCase();
          
                  if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                    // Display image
                    return (
                      <div key={file} className="w-32">
                        <img
                          src={file}
                          alt={`file-${index}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    );
                  } else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
                    // Display video
                    return (
                      <div key={file} className="w-32">
                        <video
                          controls
                          className="w-full h-full rounded-lg"
                        >
                          <source src={file} type={`video/${fileExtension}`} />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    );
                  } else if (['mp3', 'wav', 'ogg'].includes(fileExtension)) {
                    // Display audio
                    return (
                      <div key={file} className="w-32">
                        <audio
                          controls
                          className="w-full"
                        >
                          <source src={file} type={`audio/${fileExtension}`} />
                          Your browser does not support the audio tag.
                        </audio>
                      </div>
                    );
                  } else if (['pdf'].includes(fileExtension)) {
                    // Display PDF
                    return (
                      <div key={file} className="w-32">
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          Open PDF
                        </a>
                      </div>
                    );
                  } else if (['doc', 'docx'].includes(fileExtension)) {
                    // Handle DOC/DOCX files (viewable via a link)
                    return (
                      <div key={file} className="w-32">
                        <a
                          href={`https://docs.google.com/viewer?url=${file}&embedded=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500"
                        >
                          View Document
                        </a>
                      </div>
                    );
                  } else {
                    // Handle unknown file types
                    return (
                      <div key={file} className="w-32">
                        <a
                          href={file}
                          download={`file-${index}`}
                          className="text-blue-500"
                        >
                          Download File
                        </a>
                      </div>
                    );}
                })
                }
              </div>
              )}
              {msg.content}
              {msg.sender === userId && (
                <span className="text-xs text-white ml-2">
                  {msg.read ? '✔✔' : msg.sent ? '✔' : ''}
                </span>
              )}
              {/* Scroll to this div */}
              <div ref={messageEndRef} />
            </div>
          ))}
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 w-64">
          <h3 className="text-lg font-semibold text-gray-700">Selected Files:</h3>
          <ul className="mt-2 space-y-2">
            {Array.from(files).map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md border">
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Input Box */}
      <InputField handleFileChange={handleFileChange} 
      selectedId={selectedId}
      setMessage={setMessage}
      files={files}
      setFiles={setFiles} />
    </div>
  )
});

export default Chats