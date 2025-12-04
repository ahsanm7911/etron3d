import { useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { auth } from '../utils/auth';
import { AppContext } from "../contexts/AppContext";

export default function AuthSuccess() {
    const { setUser } = useContext(AppContext);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get("token");

    const fetchUserData = async () => {
        try {
            const res = await api.get('/auth/profile/', 
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            console.log("Response: ", res.data);
            auth.saveTokens(res.data.tokens.access, res.data.tokens.refresh);
            setUser(res.data.user);
            navigate('/dashboard')
        } catch (error) {
            console.log(error);
        }
    }

    useEffect (() => {
        fetchUserData();
    }, [])

    return (
        <div className='text-center'>Logging you in...</div>
    )
}