import { useEffect, useState } from 'react'
import {
    Chats,
    PhoneCall,
    Archive,
    MagnifyingGlass,
    SignOut,
    Sun,
    UserGear,
    Users
} from '@phosphor-icons/react'
import { useUser } from '../contexts/AppContext';
import axios from './axiosConfig';
import { useNavigate } from 'react-router-dom';


function Sidebar({ onIconClick, selectedOption }) {

    const { iconSize, setIconSize } = useUser();
    const navigate = useNavigate();

    const icons_array = [
        <Chats size={iconSize} />,
        <MagnifyingGlass size={iconSize} />,
        <PhoneCall size={iconSize} />,
        <UserGear size={iconSize} />,
        <Users size={iconSize} />
    ];
    useEffect(() => {
        const handleResize = () => {
            setIconSize(window.innerWidth >= 768 ? 32 : 16);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);



    const handleLogout = () => {
        // Clear token from localStorage


        // make a request to the backend to log out the session 
        axios.post('/auth/logout').then(response => {
            // Redirect user to login page
            localStorage.removeItem("token");
            navigate("/auth");
            alert(response.data.message);
        }).catch(error => {
            console.log(error);
            alert("Unable to Logout");
        });


    };

    return (
        <div className='min-h-12 md:w-1/12 md:h-full'>
            <div className='hidden md:flex flex-col min-h-full min-w-full items-center justify-between border-r-2 text-icongreen border-greyborder /'>

                <ul className='max-w-full'>
                    <li className='flex justify-center'><img src="image.png" alt="logo" className='w-14 h-14 cursor-pointer' /></li>
                    {
                        ['chats', 'search', 'calls', 'user', 'friends'].map((option, index) => (
                            <li key={option}
                                className={`cursor-pointer m-2 flex justify-center rounded-xl hover:shadow-glow transition-shadow duration-300 md:p-2 lg:p-4 
                                    ${selectedOption === option ? 'text-white bg-icongreen shadow-lg' : ''}
                                    `}
                                onClick={() => onIconClick(option)}
                            >
                                {icons_array[index]}
                                
                                {/* Show friend requests count for friends icon */}

                            </li>
                        ))
                    }
                </ul>


                <ul className='max-w-full'>
                    <li className='cursor-pointer m-4'>
                        <Sun size={iconSize} />
                    </li>
                    <li className='cursor-pointer p-4 mb-1 rounded-xl hover:shadow-lg' onClick={handleLogout} >
                        <SignOut size={iconSize} />
                    </li>
                </ul>

            </div>

            <div className='fixed top-0 left-0 right-0 md:hidden h-12 text-center bg-white border-b-2 border-greyborder p-2 font-semibold text-gray-800 '>
                Camel
            </div>

            <div className='fixed bottom-0 left-0 right-0 border-t-2 bg-white border-greyborder md:hidden'>
                <ul className='flex justify-around'>
                    {
                        ['chats', 'search', 'calls', 'user', 'friends'].map((option, index) => (
                            <li key={option}
                                className={`cursor-pointer m-2 flex justify-center text-icongreen rounded-xl hover:shadow-glow transition-shadow duration-300 md:p-2 lg:p-4 
                                    ${selectedOption === option ? 'text-white bg-icongreen shadow-lg' : ''}
                                    `}
                                onClick={() => onIconClick(option)}
                            >
                                {
                                    icons_array[index]
                                }
                                
                                
                            </li>
                        ))
                    }
                </ul>
            </div>



        </div>

    )
}

export default Sidebar