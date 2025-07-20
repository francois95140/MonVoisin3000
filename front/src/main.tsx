import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./home/Home";
import Connexion from "./auth/Connexion";
import Inscription from "./auth/Inscription";
import Actualites from "./auth/Inscription";
import Services from "./auth/Inscription";
import Evenements from "./section/evenements/Evenements";
import Messages from "./auth/Inscription";
import Carte from "./auth/Inscription";
import UiMobile from "./UI/mobile";
import UiDesktop from "./UI/desktop";

const isMobile = window.matchMedia("(max-width: 767px)").matches;
const hasUserToken = sessionStorage.getItem("UserToken");
const isPublicRoute = window.location.pathname === "/connexion" || window.location.pathname === "/inscription" || window.location.pathname === "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
        {!hasUserToken ? (
          <>
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/services" element={<Services />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/carte" element={<Carte />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/connexion" replace />} />
        )}
      </Routes>
      <UiMobile />
      {hasUserToken && !isPublicRoute && (isMobile ? <UiMobile /> : <UiDesktop />)}
    </BrowserRouter>
  </StrictMode>
);
