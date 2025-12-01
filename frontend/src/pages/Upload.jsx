import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Suspense } from 'react';
import * as THREE from "three";
import api from '../utils/api';
import { auth } from '../utils/auth';
import { AppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const ModelViewer = ({ url }) => {
    const gltf = useLoader(GLTFLoader, url);
    const model = gltf.scene;
    

    // Optional rotation animation 
    useFrame(() => {
        model.rotation.y += 0.003;
    });

    return <primitive object={model} scale={1.4} />
}

export default function Upload() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultFile, setResultFile] = useState(null);
    const { setUser } = useContext(AppContext);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const checkAuth = () => {
        const user = auth.getUser();
        if(!user) return navigate("/");
    }

    useEffect(() => {
        checkAuth();
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        }
    }, [preview])

    const handleFileSelect = (fileObj) => {
        if (!fileObj) return;
        setFile(fileObj);
        setPreview(URL.createObjectURL(fileObj));
        setError(null);
        setResultFile(null);
    };

    const handleInputChange = (e) => {
        const selected = e.target.files[0];
        handleFileSelect(selected);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        handleFileSelect(dropped);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setProgress(0);

        const formData = new FormData();
        formData.append("image", file);

        // Fake progress bar animation (modified later for real)
        let progressInterval = null;
        progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + 5;
            })
        }, 200);

        try {
            const res = await api.post("/generation/image-to-3d/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setUser(res.data.user);
            setProgress(100);
            setResultFile(res.data.file_url || res.data.data?.model_file);

        } catch (err) {
            console.error("Upload error: ", err);
            setError("Failed to process image. Please try again.");
        } finally {
            setLoading(false);
            if (progressInterval) {
                setTimeout(() => {
                    clearInterval(progressInterval);
                    setProgress(0);
                }, 800);
            }
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-32 px-6 max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-extrabold mb-3">Image to 3D</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                Upload an image and we'll generate a placeholder 3D model file you can download.
            </p>

            {/* Drag & Drop Upload Box */}
            <motion.div
                className={`border-2 border-dashed rounded-2xl p-10 cursor-pointer bg-white dark:bg-gray-900 shadow-lg transition 
        ${isDragging ? "border-blue-500 bg-blue-50/60 dark:bg-blue-900/30" : "border-gray-400 dark:border-gray-600"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                whileHover={{ scale: 1.02 }}
            >
                <input
                    type="file"
                    className="hidden"
                    id="image-upload-input"
                    accept="image/*"
                    onChange={handleInputChange}
                />

                {!preview ? (
                    <div onClick={() => document.getElementById("image-upload-input").click()}>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Drag & drop an image here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4" onClick={() => document.getElementById("image-upload-input").click()}>
                        <img
                            src={preview}
                            alt="Preview"
                            className="mx-auto rounded-xl max-h-64 object-cover shadow-md"
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            Click to choose a different image
                        </span>
                    </div>
                )}
            </motion.div>

            {/* Processing Button */}
            <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={!loading && file ? { scale: 1.05 } : {}}
                onClick={handleUpload}
                disabled={!file || loading}
                className="mt-8 px-10 py-3 rounded-full text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
                {loading ? "Processing…" : "Generate 3D Model"}
            </motion.button>

            {/* Progress Bar */}
            {loading && (
                <div className="mt-6 w-full max-w-md mx-auto">
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Generating placeholder model…
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p className="mt-4 text-sm text-red-500">
                    {error}
                </p>
            )}

            {/* Result Section */}
            {resultFile && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md"
                >
                    <h2 className="text-xl font-bold mb-3">Your 3D Model Preview</h2>

                    {/* 3D Viewer */}
                    <div className="w-full h-[400px] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 mb-6">
                        <Canvas camera={{ position: [2, 2, 3], fov: 50 }}>
                            <ambientLight intensity={0.5} />
                            <directionalLight intensity={1} position={[5, 5, 5]} />
                            <Suspense fallback={null}>
                                <ModelViewer url={resultFile} />
                            </Suspense>
                            <OrbitControls enablePan={true} enableZoom={true} />
                            <Environment preset="studio" />
                        </Canvas>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center gap-4">
                        <a
                            href={resultFile}
                            download
                            className="px-6 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                        >
                            Download Model
                        </a>

                        <button
                            onClick={handleUpload}
                            className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                            Retry Generation
                        </button>
                    </div>
                </motion.div>
            )}

        </div>
    )
}