import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Pricing from "./pages/Pricing";
import { ThemeProvider } from "./utils/theme.jsx";


// Wrapper to handle navbar condition using useLocation
function AppWrapper() {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  const shouldShowFooter = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
      </main>

    {shouldShowFooter && <Footer/>}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <Router>
          <AppWrapper />
        </Router>
      </div>
    </ThemeProvider>
  );
}