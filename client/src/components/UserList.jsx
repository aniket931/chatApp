import { useEffect, useState } from 'react';
import Card from './Card.jsx';
import { useUser } from '../contexts/AppContext.jsx';
import axios from './axiosConfig.js';
import socket from '../contexts/socket.js';

function UserList() {
    const { setSelectedUser, selectedUser, activeComponent } = useUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [calls, setCalls] = useState([]);
    const [displayedData, setDisplayedData] = useState([]);



    // Initial load of user data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/users/friends');
                console.log("Fetched friends", response.data.data);
                setUsers(response.data.data); // Set the users data
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();

        socket.on('accept_request', () => {
            fetchData();
        });

        return () => {
            socket.off('accept_request');
        };

    }, []); // Runs only once when the component mounts

    // Update displayedData when users state changes
    useEffect(() => {
        setDisplayedData(users);
    }, [users]);

    useEffect(() => {
        if (activeComponent === 'chats') {
            // Filter only users based on search term
            setDisplayedData(
                users.filter(user => user.username.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        else if (activeComponent === 'search') {
            // Display all fetched users for search
            setDisplayedData([]);
        }
       
    }, [activeComponent, searchTerm]);


    const handleSend = async () => {
        if (!searchTerm.trim()) return;
        if (activeComponent === 'search') {
            try {

                const res = await axios.get('/users', {
                    params: { username: searchTerm },
                    withCredentials: true
                });
                setDisplayedData(res.data.data);

            } catch (error) {
                console.log(error);
                alert(error.response.data.message);
            }
        }

    }


    return (
        <div className={`custom-container flex-col ${selectedUser ? 'hidden md:flex' : 'flex'} `}>
            <div className='flex p-2 border-b-2 border-greyborder'>
                <p className='mr-2 text-nowrap'>
                    {activeComponent === 'chats' ? 'Active Conversations' :
                        activeComponent === 'search' ? 'Search' :
                            activeComponent === 'calls' ? 'Calls' : "Friend Requests"}
                </p>
                {activeComponent === 'chats' && users.length > 0 && (
                    
                    <span className='flex items-center justify-center w-6 h-6 bg-icongreen text-white text-xs font-bold rounded-full'>{users.length}</span>
                )}
            </div>
            <div className='m-2'>
                <input
                    type="text"
                    placeholder='Username...'
                    name='username'
                    className='w-full p-2 rounded-xl border-2 focus:outline-icongreen'
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={
                        (e) => e.key === "Enter" && handleSend()
                    }
                />
            </div>

            <div className='flex-1 overflow-y-auto thin-scrollbar scroll-snap overflow-x-hidden '>
                {
                    console.log("going to render display data", displayedData)
                }
                {displayedData.map((data, index) => (
                    <div key={index} className="snap-start" onClick={() =>
                        setSelectedUser(data.username)

                    }>
                        <Card
                            imageSrc={data.profilePic}
                            username={data.username}
                            lastMessage={data.lastMessage}
                            unreadCount={data.unreadCount}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UserList;
