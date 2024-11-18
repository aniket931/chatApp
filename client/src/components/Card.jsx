import { Phone, VideoCamera, CheckCircle, PlusCircle } from '@phosphor-icons/react';
import { useUser } from '../contexts/AppContext';
const Card = ({ imageSrc, username, lastMessage, unreadCount }) => {
    const { iconSize, activeComponent } = useUser();

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

                {/* Show different content based on activeComponent */}
                {activeComponent === 'chats' && (
                    <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
                )}

            </div>

            {/* Right Section Icons based on activeComponent */}
            {activeComponent === 'chats' && unreadCount > 0 && (
                <div className="flex items-center justify-center w-6 h-6 bg-icongreen text-white text-xs font-bold rounded-full">
                    {unreadCount}
                </div>
            )}

            {/* {activeComponent === 'search' && (
                <div className="flex items-center gap-2">
                    {isFriend ? (
                        <CheckCircle size={iconSize} color="#59d95b" className="cursor-pointer" />
                    ) : (
                        <PlusCircle size={iconSize} color="#59d95b" className="cursor-pointer" />
                    )}
                </div>
            )} */}

            {/* {activeComponent === 'calls' && (
                <div className="flex items-center rounded-2xl gap-2 md:p-1 md:gap-4">
                    <Phone size={iconSize} color="#59d95b" className="cursor-pointer" />
                    <VideoCamera size={iconSize} color="#59d95b" className="cursor-pointer" />
                </div>
            )} */}

        </div>
    );
};

export default Card;
