import React, { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import AnnouncementHeader from "./components/AnnouncementHeader.jsx";
import GenerateButton from "./components/GenerateButton.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Pricing from "./pages/Pricing";
import AssetsPage from "./pages/Assets";
import AuthSuccess from "./pages/Auth-Success.jsx";
import { ThemeProvider } from "./utils/theme.jsx";
import { AppContext, AppProvider } from "./contexts/AppContext";
import { auth } from "./utils/auth.jsx";


// Wrapper to handle navbar condition using useLocation
function AppWrapper() {
  const location = useLocation();
  const { user } = useContext(AppContext);
  const hideNavbarRoutes = ["/login", "/register"];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);
  const shouldShowFooter = !hideNavbarRoutes.includes(location.pathname);
  const showAnnBanner = user?.subscription.plan == "free" && location.pathname === "/dashboard";
  const isLoggedIn = auth.getUser() ? true : false

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      {showAnnBanner && <AnnouncementHeader />}
      {isLoggedIn && <GenerateButton/>}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/auth-success" element={<AuthSuccess />} />
        </Routes>
      </main>

      {shouldShowFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <div className="min-h-screen">
          <Router>
            <AppWrapper />
          </Router>
        </div>
      </ThemeProvider>
    </AppProvider>
  );
}
