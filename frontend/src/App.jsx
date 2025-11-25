import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import { ThemeProvider } from "./utils/theme.jsx";


export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Router>
          {!["/login","/register"].includes(window.location.pathname) && <Navbar />}
          <main className="max-w-6xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<Upload />} />
            </Routes>
          </main>
        </Router>
      </div>
    </ThemeProvider>
  );
}