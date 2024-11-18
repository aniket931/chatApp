import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {

    const [activeComponent, setActiveComponent] = useState('chats');
    
    const [selectedUser, setSelectedUser] = useState(null);
    const [iconSize, setIconSize] = useState(window.innerWidth >= 768 ? 32 : 16);
    console.log(selectedUser);

    function handleSidebarClick(component) {
        setActiveComponent(component);
        setSelectedUser(null);
    };

    function handleUserSelect(username) {
        setSelectedUser(username);
    };

    return (
        <AppContext.Provider value={{ activeComponent, iconSize, setIconSize, setActiveComponent, handleSidebarClick, selectedUser, setSelectedUser, handleUserSelect }}>
            {children}
        </AppContext.Provider>
    )
};

export const useUser = () => {
    return useContext(AppContext);
};
