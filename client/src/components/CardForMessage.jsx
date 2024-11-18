import { Phone, VideoCamera } from '@phosphor-icons/react';
import { useUser } from '../contexts/AppContext';
import socket from '../contexts/socket.js';
import peer from '../service/peer.js';
const CardForMessageBox = ({ imageSrc, username, lastSeen = null, isFriend = false }) => {
    const { iconSize } = useUser();
    const userId = localStorage.getItem('token');


    const handleVideoCall = async() => {
        const offer = await peer.getOffer();
        const callData = { to: username, from: userId, offer }; // Replace `yourUsername` with the current user's username.
        
        socket.emit('video-call', callData);
    };


    return (
        <div className="flex items-center p-4 bg-white shadow border-b-2 cursor-pointer rounded-lg max-w-full">
            {/* Profile Image */}
            <img
                src={imageSrc}
                alt={username}
                className="w-12 h-12 rounded-full object-cover mr-4"
            />

            {/* Conditional Content */}
            <div className="flex-1 w-9">
                <p className="font-semibold text-gray-800 truncate">{username}</p>
                {isFriend && (
                    <p className="text-sm text-gray-500 truncate">{lastSeen}</p>
                )}
            </div>

            {/* Right Section Icons */}




            {isFriend && (
                <div className="flex items-center rounded-2xl gap-2 md:p-1 md:gap-4">
                    <Phone
                        size={iconSize}
                        color="#59d95b"
                        className="cursor-pointer"
                        onClick={handleVideoCall} />
                    <VideoCamera
                        size={iconSize}
                        color="#59d95b"
                        className="cursor-pointer"
                        onClick={handleVideoCall}
                    />;
                </div>
            )}

        </div>
    );
};

export default CardForMessageBox;