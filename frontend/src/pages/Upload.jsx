import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { OrbitControls, Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { Suspense } from 'react';
import * as THREE from "three";
import api from '../utils/api';
import { auth } from '../utils/auth';
import { AppContext } from '../contexts/AppContext';
import { getErrorMessage } from '../utils/errors';
import { useNavigate } from 'react-router-dom';
import ModelViewer from '../components/ModelViewerGLTF.jsx';


export default function Upload() {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [resultFile, setResultFile] = useState(null);
    const { setUser } = useContext(AppContext);
    const [error, setError] = useState(null);
    const [consented, setConsented] = useState(false);
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
            if (res.data.user) {
              setUser(res.data.user);
            }
            setProgress(100);
            console.log("FILE_URL: ", res.data.file_url);
            setResultFile(res.data.file_url || res.data.data?.model_file);

        } catch (err) {
            const errMsg = getErrorMessage(err, "Generation failed. Please try again.");
            console.error("Upload error: ", errMsg);
            setError(errMsg);
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
                Upload an image and we'll generate a 3D model file you can download.
            </p>

            {/* ── Upload Guide ─────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mb-6 max-w-xl mx-auto bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden text-left"
            >
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-gray-700/60">
                    <svg className="w-4 h-4 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-300 tracking-wider uppercase">Tips for best results</span>
                </div>

                <div className="p-4 grid sm:grid-cols-2 gap-3">
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-600/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-200 mb-0.5">Supported Formats</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Upload <span className="text-gray-300 font-medium">PNG</span> or <span className="text-gray-300 font-medium">JPEG</span> files only. Higher resolution images produce better geometry.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-600/15 border border-emerald-600/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-200 mb-0.5">Use a Plain Background</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                A <span className="text-gray-300 font-medium">solid white</span> or light background gives the AI cleaner edges and dramatically improves model quality.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/15 border border-purple-600/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.894L15 14m0 0V10m0 4H5a2 2 0 01-2-2V8a2 2 0 012-2h10v8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-200 mb-0.5">Center Your Subject</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Keep the object centered and fully visible. Avoid partial crops — the full silhouette helps reconstruct accurate geometry.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-yellow-600/15 border border-yellow-600/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-gray-200 mb-0.5">Even Lighting</p>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Avoid heavy shadows or strong directional light. Evenly lit photos produce more accurate textures on the final model.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* ── Drag & Drop Upload Box ────────────────────────────────────── */}
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
                    accept="image/png, image/jpeg"
                    onChange={handleInputChange}
                />

                {!preview ? (
                    <div onClick={() => document.getElementById("image-upload-input").click()}>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Drag & drop an image here, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">PNG or JPEG · Max 10 MB</p>
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
            <motion.label
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mt-6 flex items-start gap-3 max-w-md mx-auto text-left cursor-pointer group"
            >
                <div className="relative mt-0.5 shrink-0">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={consented}
                        onChange={e => setConsented(e.target.checked)}
                    />
                    <div className="w-5 h-5 rounded-md border-2 border-gray-600 bg-gray-900 peer-checked:bg-blue-600 peer-checked:border-blue-600 group-hover:border-gray-400 transition-all flex items-center justify-center">
                        {consented && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                    I confirm that I own the rights to this image or have permission to use it, and I agree to the{' '}
                    <a href="/terms" className="text-blue-400 hover:text-blue-300 underline underline-offset-2" onClick={e => e.stopPropagation()}>Terms of Service</a>.
                    Generated models are free to use for personal or commercial projects.
                </p>
            </motion.label>

            {/* ── Generate Button ───────────────────────────────────────────── */}
            <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={!loading && file ? { scale: 1.05 } : {}}
                onClick={handleUpload}
                disabled={!file || loading || !consented}
                className="mt-8 mb-6 px-10 py-3 rounded-full text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
                {loading ? "Processing…" : "Generate 3D Model"}
            </motion.button>

            {/* ── Progress Bar ──────────────────────────────────────────────── */}
            {loading && (
                <div className="mt-6 w-full max-w-md mx-auto">
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 transition-all duration-200"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Generating model…
                    </p>
                </div>
            )}

            {/* ── Error Message ─────────────────────────────────────────────── */}
            {error && (
                <p className="mt-4 text-sm text-red-500">
                    {error}
                </p>
            )}

            {/* ── Result Section ────────────────────────────────────────────── */}
            {resultFile && <ModelViewer url={resultFile}/>}
        </div>
    )
}
