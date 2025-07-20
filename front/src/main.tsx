import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./home/Home";
import Connexion from "./auth/Connexion";
import Inscription from "./auth/Inscription";
import Actualites from "./auth/Inscription";
import Trock from "./trock/Trock";
import Evenements from "./section/evenements/Evenements";
import Messages from "./auth/Inscription";
import Carte from "./auth/Inscription";
import UserHeader from "./UI/head";
import Navbar from "./UI/navbar";
import ProfilePage from "./profile/Profile";
import EditUser from "./auth/Edit";

const hasUserToken = sessionStorage.getItem("UserToken");
const profileImage = sessionStorage.getItem("UserImage");
const pseudo = sessionStorage.getItem("UserPseudo") || "Utilisateur";
const isPublicRoute = window.location.pathname === "/connexion" || window.location.pathname === "/inscription" || window.location.pathname === "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      {!hasUserToken && !isPublicRoute && <UserHeader
        profileImage={profileImage || ""}
        pseudo={pseudo}
       />}
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/connexion" element={<Connexion />} />
      <Route path="/inscription" element={<Inscription />} />
        {!hasUserToken ? (
          <>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/editprofil" element={<EditUser />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/trock" element={<Trock />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/carte" element={<Carte />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/connexion" replace />} />
        )}
      </Routes>
      {!hasUserToken && !isPublicRoute && <Navbar />}
    </BrowserRouter>
  </StrictMode>
);
