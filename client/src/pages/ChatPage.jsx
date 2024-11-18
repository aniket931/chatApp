import React, { useCallback, useContext, useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import UserList from '../components/UserList'
import MessageBox from '../components/MessageBox'
import Profile from '../components/Profile'
import { useUser } from '../contexts/AppContext'
import { useNavigate } from 'react-router-dom'
import socket from '../contexts/socket'
import peer from '../service/peer'


function ChatPage() {

  const { activeComponent, handleSidebarClick, selectedUser } = useUser();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
 


  const navigate = useNavigate();
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/auth');
    }
  }, [navigate]);

  useEffect(() => {
    // Manually connect when the component mounts
    socket.connect();

    // Listen for an event (for example, 'message')
    const userId = localStorage.getItem('token');
    socket.emit("register", userId);

    socket.on('incoming-video-call', async (data) => {
      console.log("call incoming", data);
      const { from, to, fromId, offer } = data;
      const accept = confirm(`Incoming video call from ${from}. Accept?`);
      if (accept) {
        const ans = await peer.getAnswer(offer);
        console.log("ans", ans);
        const room = `${from}-${to}`; // Create a unique room ID.
        socket.emit('join-video-room', { room, from, to, fromId, ans });
        navigate('/video'); // Join the room.
        // Redirect to the video chat page or start video chat UI
      }
    });

    socket.on('user-joined', async (data) => {
      console.log("user-joined", data);
      const { room, ans } = data;
      await peer.setLocalDescription(ans);
      // Add the local stream to the peer connection and set it
      const localStream = await peer.getLocalStream();
      setLocalStream(localStream);

      // Now add the stream to the peer connection for sending
      localStream.getTracks().forEach(track => {
        peer.peer.addTrack(track, localStream);
      });
      
      console.log("user has joined call");
      navigate('/video');
    });

    // socket.on("peer:nego:needed", handleNegoNeedIncomming);
    // socket.on("peer:nego:final", handleNegoNeedFinal);
   
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
      socket.off('incoming-video-call');
      socket.off('user-joined');
      // socket.off("peer:nego:needed", handleNegoNeedIncomming);
      // socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, []);

  // const handleNegoNeeded = useCallback(async () => {
  //   const offer = await peer.getOffer();
  //   socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  // }, [remoteSocketId, socket]);

  // useEffect(() => {
  //   peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
  //   return () => {
  //     peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  //   };
  // }, [handleNegoNeeded]);

  // const handleNegoNeedIncomming = useCallback(
  //   async ({ from, offer }) => {
  //     const ans = await peer.getAnswer(offer);
  //     socket.emit("peer:nego:done", { to: from, ans });
  //   },
  //   [socket]
  // );

  // const handleNegoNeedFinal = useCallback(async ({ ans }) => {
  //   await peer.setLocalDescription(ans);
  // }, []);



  return (
    <div className='flex flex-col h-screen md:flex-row'>
      <Sidebar selectedOption={activeComponent} onIconClick={handleSidebarClick} />
      {
        activeComponent === 'user' ? <Profile /> : <UserList />
      }

      {(selectedUser && <MessageBox />)}
      {!selectedUser && <p className='hidden flex-1 md:flex justify-center border-r-2 items-center font-semibold text-gray-800 '>
        Select a user to start conversation</p>}

    </div>
  )
}

export default ChatPage