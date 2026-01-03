import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";

export const AuthContext = createContext({});


const client = axios.create({
    baseURL: `${server}/api/v1/users`
});

export const AuthProvider = ({ children }) => {


    const [userData, setUserData] = useState(null);


    const router = useNavigate();

const handleRegister = async (name, username, password) => {
  try {
    const request = await client.post("/register", {
      name,
      username,
      password,
    });

    if (request.status === httpStatus.CREATED) {
      return {
        success: true,
        message: request.data?.message || "User registered successfully",
      };
    }

    // fallback (rare case)
    return {
      success: false,
      message: "Registration failed",
    };

  } catch (err) {
    return {
      success: false,
      message:
        err.response?.data?.message ||
        err.message ||
        "Registration failed",
    };
  }
};




const handleLogin = async (username, password) => {
    try {
        let request = await client.post("/login", { username, password });
        if (request.status === 200) {
            localStorage.setItem("token", request.data.token);
            return { success: true }; 
        }
    } catch (err) {
        return { 
            success: false, 
            message: err.response?.data?.message || "Server Error" 
        };
    }
}




    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }

    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    );
};
