import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});


const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users"
});

export const AuthProvider = ({ children }) => {

    const [userData, setUserData] = useState(null);
    const router = useNavigate();

const handleRegister = async (name, username, password) => {
    try {
        const request = await client.post("/register", { name, username, password });
        // Return a success object
        return { success: true, message: request.data.message };
    } catch (err) {
        // Return the actual error message from the backend (the 409 message)
        return { 
            success: false, 
            message: err.response?.data?.message || "Registration failed" 
        };
    }
};

const handleLogin = async (username, password) => {
    try {
        const request = await client.post("/login", {
            username,
            password
        });
        
        if (request.status === httpStatus.OK) {
            localStorage.setItem("token", request.data.token);
            setUserData(request.data.user);
            // router("/home");
            return { success: true }; 
        }
    } catch (err) {
        // Return the error so your Login page can show "User Not Found" or "Wrong Password"
        return { 
            success: false, 
            message: err.response?.data?.message || "Login failed" 
        };
    }
};

    const data = {
        userData,
        setUserData,
        handleRegister,
        handleLogin
    };

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
