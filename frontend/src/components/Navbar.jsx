import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "../utils/theme.jsx";

/**
 * Navbar component:
 * - Shows logo + nav links
 * - Contains a dark/light theme toggle switch
 * - Adapts to whether a user is stored in localStorage
 */
export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full px-4 sm:px-6 py-3 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
    >
      {/* Left: Brand */}
      <Link
        to="/"
        className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
      >
        3DGen
      </Link>

      {/* Right: Links + Theme Toggle */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Theme Toggle Switch */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform ${
              theme === "dark" ? "translate-x-5" : "translate-x-1"
            }`}
          />
          <span className="sr-only">Toggle dark mode</span>
        </button>

        {/* Auth Links */}
        {!user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-transform transition-colors"
            >
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="text-sm font-medium px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-transform transition-colors"
            >
              Upload Image
            </Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
