import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../utils/auth";

export default function Home() {
    const navigate = useNavigate();

    function handleGenerate() {
        const user = auth.getUser();
        if (!user) return navigate("/login");
        navigate("/upload");
    }


    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center text-center relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-purple-600/20 to-gray-900 dark:from-gray-900 dark:via-purple-900/40 dark:to-black blur-3xl opacity-60 -z-10"></div>


            {/* Futuristic Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] -z-10"></div>


            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl sm:text-6xl font-extrabold text-gray-900 dark:text-white drop-shadow-lg"
            >
                Transform Images Into
                <br />
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Futuristic 3D Models
                </span>
            </motion.h1>


            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="max-w-xl mt-6 text-gray-700 dark:text-gray-300 text-lg"
            >
                Upload an image and let our AI-powered engine generate a stunning 3D model instantly.
            </motion.p>


            {/* Generate Button */}
            <motion.button
                onClick={handleGenerate}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                className="mt-10 px-10 py-4 rounded-full text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition"
            >
                Generate
            </motion.button>


            {/* Steps */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-16 grid sm:grid-cols-3 gap-8 w-full max-w-4xl px-4"
            >
                <div className="p-6 bg-white/70 dark:bg-gray-900/60 backdrop-blur rounded-xl shadow">
                    <h3 className="text-xl font-bold mb-2">1. Upload</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Choose any image of an object or product.</p>
                </div>


                <div className="p-6 bg-white/70 dark:bg-gray-900/60 backdrop-blur rounded-xl shadow">
                    <h3 className="text-xl font-bold mb-2">2. Generate</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Our AI transforms it into a detailed 3D model.</p>
                </div>


                <div className="p-6 bg-white/70 dark:bg-gray-900/60 backdrop-blur rounded-xl shadow">
                    <h3 className="text-xl font-bold mb-2">3. Download</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Export your 3D model in GLB/OBJ format.</p>
                </div>
            </motion.div>
        </div>
    );
}