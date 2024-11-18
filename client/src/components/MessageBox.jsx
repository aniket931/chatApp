import { useEffect, useState } from 'react';
import { useUser } from '../contexts/AppContext';
import axios from './axiosConfig'
import Chats from './Chats';
import CardForMessageBox from './CardForMessage';
import socket from '../contexts/socket';

function MessageBox() {
    const { selectedUser } = useUser();
    const [friendStatus, setFriendStatus] = useState(null);
    const [loading, setLoading] = useState(true);


    const handleSendRequest = async () => {
        try {
            const response = await axios.post('/friends/send-request',
                { username: selectedUser },  // Payload containing the target username
                { withCredentials: true }  // Include credentials if using cookies for auth
            );
            setFriendStatus((prev) => ({ ...prev, status: 'requested' }));
        } catch (error) {
            console.error("Error sending friend request:", error);
            alert(error.response?.data?.message || "An error occurred.");
        }
    }

    const cancelFriendRequest = async () => {
        try {
            const response = await axios.post(
                '/friends/cancel-request',
                { username: selectedUser },
                { withCredentials: true }
            );
            console.log(response.data.message);
            setFriendStatus((prev) => ({ ...prev, status: 'noRequest' }));
        } catch (error) {
            console.error("Error cancelling friend request:", error);
            alert(error.response?.data?.message || "Error cancelling friend request.");
        }
    };

    const handleRejectRequest = async () => {
        try {
            const response = await axios.post(
                '/friends/reject-request',
                { username: selectedUser },
                { withCredentials: true }
            );
            console.log(response.data.message);
            setFriendStatus((prev) => ({ ...prev, status: 'noRequest' }));
        } catch (error) {
            console.error("Error rejecting friend request:", error);
            alert(error.response?.data?.message || "Error cancelling friend request.");
        }
    };

    const handleAcceptRequest = async () => {
        try {
            const response = await axios.post(
                '/friends/accept-request',
                { username: selectedUser },
                { withCredentials: true }
            );
            console.log(response.data.message);
            setFriendStatus((prev) => ({ ...prev, status: 'friend' }));
        } catch (err) {
            console.log("Error accepting request", err);
        }
    };

    const handleBlockUser = async () => {
        try {
            const response = await axios.post(
                '/friends/block-user',
                { username: selectedUser },
                { withCredentials: true }
            );
            console.log(response.data.message);
            setFriendStatus((prev) => ({ ...prev, status: "yBlocked" }));
        } catch (err) {
            console.log("Error Blocking user", err);
            alert(err.response?.data?.message || "Error blocking user");
        }
    };

    const handleUnlockUser = async () => {
        try {
            const response = await axios.post(
                '/friends/unblock-user',
                { username: selectedUser },
                { withCredentials: true }
            );
            console.log(response.data.message);
            setFriendStatus((prev) => ({ ...prev, status: 'noRequest' }));
        } catch (err) {
            console.log("Error unblocking user", err);
            alert(err.response?.data?.message || "Error unblocking user");
        }
    };


    // make api call here
    useEffect(() => {
        if (selectedUser) {
            // Make API call to check friend status
            const checkFriendStatus = async () => {
                try {
                    const response = await axios.get('/users/friend-status', {
                        params: { username: selectedUser },
                        withCredentials: true
                    });
                    console.log("friendStatus", response.data);
                    setFriendStatus(response.data);
                } catch (error) {
                    console.error("Error fetching friend status:", error);
                } finally {
                    setLoading(false);
                }
            };

            checkFriendStatus();

        }

        socket.on('recieve_request', (data) => {
            console.log("recieved", data);
            if (data.username === selectedUser) {
                setFriendStatus((prev) => ({ ...prev, status: 'recieved' }));
            }
        });

        socket.on('accept_request', (data) => {
            console.log("recieved", data);
            if (data.username === selectedUser) {
                setFriendStatus((prev) => ({ ...prev, status: 'friend' }));
            }
        });

        socket.on('reject_request', (data) => {
            console.log("recieved", data);
            if (data.username === selectedUser) {
                setFriendStatus((prev) => ({ ...prev, status: 'noRequest' }));
            }
        });

        socket.on('cancelled_request', (data) => {
            console.log("recieved", data);
            if (data.username === selectedUser) {
                setFriendStatus((prev) => ({ ...prev, status: 'noRequest' }));
            }
        });

        socket.on('blocked_me', (data) => {
            console.log("recieved", data);
            if (data.username === selectedUser) {
                setFriendStatus((prev) => ({ ...prev, status: 'blocked' }));
            }
        });

        socket.on('unblocked_me', (data) => {
            console.log("recieved", data);
            if (data.username === selectedUser) {
                setFriendStatus((prev) => ({ ...prev, status: 'noRequest' }));
            }
        });

    
        return () => {
            socket.off('recieve_request');
            socket.off('accept_request');
            socket.off('reject_request');
            socket.off('cancelled_request');
            socket.off('blocked_me');
            socket.off('unblocked_me');

        }

    }, [selectedUser]);


    if (loading) {
        return (
            <div className=" flex justify-center items-center flex-1">
                <div>Loading...</div>
            </div>
        );
    }

    return (
        <div className='flex flex-col flex-1 border-r-2 border-[#e5e7eb]'>
            {console.log(friendStatus)}

            <CardForMessageBox
                imageSrc={friendStatus.profilePic}
                username={selectedUser}
                lastSeen="A few mins ago"
                isFriend={friendStatus.status === "friend" ? true : false}
            />
            {loading ? (<div>Loading...</div>) : null}
            {friendStatus.status === "friend" ? (
                <Chats selectedId={friendStatus.selectedId} />
            ) : friendStatus.status === "noRequest" ?
                (

                    <div className="flex justify-center items-center flex-1">
                        <div className='flex flex-col gap-2'>
                            <button onClick={handleSendRequest}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                Send Request
                            </button>
                            <button onClick={handleBlockUser}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg">
                                Block User
                            </button>
                        </div>
                    </div>
                ) : friendStatus.status === "requested" ?
                    (
                        <div className="flex justify-center items-center flex-1">
                            <button
                                onClick={cancelFriendRequest}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                Cancel Friend Request
                            </button>
                        </div>
                    ) : friendStatus.status === "yBlocked" ?
                        (
                            <div className="flex justify-center items-center flex-1">
                                <button
                                    onClick={handleUnlockUser}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                    Unblock User
                                </button>
                            </div>
                        ) : friendStatus.status === "recieved" ? (
                            <div className="flex justify-center items-center flex-1">
                                <div className='flex flex-col gap-2'>
                                    <button
                                        onClick={handleAcceptRequest}
                                        className="bg-green-500 text-white px-4 py-2 rounded-lg">
                                        Accept
                                    </button>
                                    <button
                                        onClick={handleRejectRequest}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                                        Reject
                                    </button>
                                    <button
                                        onClick={handleBlockUser}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg">
                                        Block
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center flex-1">
                                <div className="  px-4 py-2 rounded-lg">
                                    You have been Blocked
                                </div>
                            </div>
                        )}
        </div>
    );
}

export default MessageBox;