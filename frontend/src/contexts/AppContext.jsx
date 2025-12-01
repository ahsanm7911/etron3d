import { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [user, setUser] = useState(() => {
        return JSON.parse(localStorage.getItem("user"));
    })

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(user));
    }, [user])

    return (
        <AppContext.Provider value={{ user, setUser }}>
            { children }
        </AppContext.Provider>
    )
}