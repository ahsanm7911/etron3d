import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ThemeContext } from "../utils/theme";
import { auth } from "../utils/auth";
import { AppContext } from "../contexts/AppContext";
import api from '../utils/api'

/**
 * Navbar component:
 * - Shows logo + nav links
 * - Contains a dark/light theme toggle switch
 * - Adapts to whether a user is stored in localStorage
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const username = user ? user?.email.split('@')[0] : "";
  const credits = user ? user?.subscription.credits_remaining : "";
  const plan = user ? user?.subscription.plan.toUpperCase() : "";


  const handleLogout = () => {
    try {
      const refresh = localStorage.getItem("refresh_token");
      const access = localStorage.getItem("access_token");
      if (refresh) {
        api.post("/auth/logout/", { refresh }, {
          headers: {
            Authorization: `Bearer ${access}`
          }
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    }

    setUser(null);
    auth.clear();
    setOpen(false);
    navigate("/");
  }

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

      <div className="hidden md:flex items-center gap-8 text-sm font-medium">
        <a href="#features" className="hover:text-blue-500 transition">Features</a>
        <Link to="/pricing" className="hover:text-blue-500 transition">Pricing</Link>
        <a href="#solutions" className="hover:text-blue-500 transition">Solutions</a>
        <a href="#community" className="hover:text-blue-500 transition">Community</a>
        <a href="#resources" className="hover:text-blue-500 transition">Resources</a>
      </div>


      {/* <div className="hidden md:flex items-center gap-8 text-sm font-medium mr-6">
        <a href="#features" className="hover:text-blue-500 transition">Features</a>
        <a href="#pricing" className="hover:text-blue-500 transition">Pricing</a>
        <a href="#solutions" className="hover:text-blue-500 transition">Solutions</a>
        <a href="#community" className="hover:text-blue-500 transition">Community</a>
        <a href="#resources" className="hover:text-blue-500 transition">Resources</a>
      </div> */}

      {/* Right: Links + Theme Toggle */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Theme Toggle Switch */}
        
        {/* <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          className="relative inline-flex h-7 w-12 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent"
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform ${theme === "dark" ? "translate-x-5" : "translate-x-1"
              }`}
          />
          <span className="sr-only">Toggle dark mode</span>
        </button> */}

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
            <div className="px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-semibold shadow">
              {credits} Credits
            </div>
            <div className="relative">
              <button onClick={() => setOpen(!open)} className="h-9 w-9 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-sm font-bold cursor-pointer">
                {user.email ? user.email.charAt(0).toUpperCase() : "U"}
              </button>


              {/* Dropdown */}
              <div className={`absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg opacity-0 transition ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="user-info px-4 py-2 flex flex-row justify-between">
                  <p>{username}</p>
                  <p className="border text-yellow-400 rounded-full shadow-lg border-yellow-400 px-2 py-1 text-xs inline-block">{plan}</p>
                </div>
                <div className="h-px bg-gray-700 my-2"></div>
                <ul className="text-sm text-gray-700 dark:text-gray-300 py-2">
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Account Settings</li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">Billing</li>
                  <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-500">
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
