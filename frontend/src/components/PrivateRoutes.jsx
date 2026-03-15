import { Navigate } from "react-router-dom";
//import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
    const  token  = localStorage.getItem('token')

    if (!token) {
        return <Navigate to ="/login" replace />
    } 

    return children
}