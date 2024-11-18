import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import peer from '../service/peer';
import ReactPlayer from "react-player";


const VideoCallPage = () => {
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Initialize the peer connection
        const initializeVideoCall = async () => {
          const localStream = await peer.getLocalStream();
          setLocalStream(localStream);
    
          peer.peer.ontrack = (event) => {
            const remoteStream = event.streams[0];
            setRemoteStream(remoteStream);
          }}
          initializeVideoCall();
    });
    return (
        <div>
          <h2>Video Call in Room: </h2>
    
          {/* Display Local Video */}
          <div>
            <h3>Your Video</h3>
            <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={localStream}
          />
          </div>
    
          {/* Display Remote Video */}
          <div>
            <h3>Remote Video</h3>
            {remoteStream ? (
              <ReactPlayer
              playing
              muted
              height="100px"
              width="200px"
              url={remoteStream}
            />
            ) : (
              <p>Waiting for remote user to join...</p>
            )}
          </div>
    
          {/* Optionally use ReactPlayer for URL-based video */}
          {/* <ReactPlayer url="video-url" playing controls /> */}
        </div>
      );
    }



export default VideoCallPage