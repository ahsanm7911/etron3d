import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';

export default function Dashboard() {
  const { user } = useContext(AppContext);
  const username = user.email.split('@')[0];

    const notImplemented = async () => {
        alert("This feature is yet to be implemeted.");
    }

    return (
        <div className="min-h-screen pt-24 pb-32 px-6">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-extrabold text-center mb-10"
            >
                Hi, {username}! Welcome to Your Dashboard
            </motion.h1>


            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-16"
            >
                Choose from a variety of powerful AI tools to turn your ideas into stunning digital assets.
            </motion.p>


            {/* Main Tools Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Image to 3D */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-2xl"
                >
                    <h3 className="text-xl font-bold mb-2">Image to 3D</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Convert any image into a fully textured 3D model.</p>
                    <Link to="/upload" className="text-blue-600 dark:text-blue-400 font-semibold">Start →</Link>
                </motion.div>


                {/* Text to 3D */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-purple-500 cursor-pointer hover:shadow-2xl"
                >
                    <h3 className="text-xl font-bold mb-2">Text to 3D</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Generate detailed 3D assets from text prompts.</p>
                    <button className="text-purple-600 dark:text-purple-400 font-semibold" onClick={notImplemented}>Coming Soon</button>
                </motion.div>


                {/* Text to Image */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-blue-500 cursor-pointer hover:shadow-2xl"
                >
                    <h3 className="text-xl font-bold mb-2">Text to Image</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Turn imagination into art using AI-powered generation.</p>
                    <button className="text-blue-600 dark:text-blue-400 font-semibold">Coming Soon</button>
                </motion.div>


                {/* 3D to Video */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-yellow-500 cursor-pointer hover:shadow-2xl"
                >
                    <h3 className="text-xl font-bold mb-2">3D to Video</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Automatically animate your 3D models into videos.</p>
                    <button className="text-yellow-600 dark:text-yellow-400 font-semibold">Coming Soon</button>
                </motion.div>
            </div>

            {/* Stats Section */}
            <section className="mt-28 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-10">Your Activity</h2>
                <div className="grid sm:grid-cols-3 gap-6">
                    <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
                        <h3 className="text-4xl font-extrabold text-blue-600 mb-2">0</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">3D Models Generated</p>
                    </motion.div>


                    <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
                        <h3 className="text-4xl font-extrabold text-purple-600 mb-2">0</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Images Created</p>
                    </motion.div>


                    <motion.div whileHover={{ scale: 1.05 }} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow border border-gray-200 dark:border-gray-700 text-center">
                        <h3 className="text-4xl font-extrabold text-green-600 mb-2">0</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Downloads This Month</p>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
