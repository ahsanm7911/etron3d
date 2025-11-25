import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../utils/api";
import { auth } from "../utils/auth";


export default function Register() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);


    async function handleRegister(e) {
        e.preventDefault();
        setError(null);
        try {
            const res = await api.post("/auth/register/", { email, password });
            auth.saveTokens(res.data.tokens.access, res.data.tokens.refresh);
            auth.saveUser(res.data.user);
            navigate("/dashboard");
        } catch (err) {
            setError("Unable to register. Email may already be in use.");
        }
    }


    return (
        <div className="flex justify-center items-center h-screen">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-xl"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-2 rounded-lg border dark:border-gray-700 dark:bg-gray-800"
                        required
                    />
                    <motion.button whileTap={{ scale: 0.95 }} type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Create Account</motion.button>
                </form>
                <p className="mt-4 text-sm text-center">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
            </motion.div>
        </div>
    );
}