import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Home from "./home/Home";
import Connexion from "./auth/Connexion";
import Inscription from "./auth/Inscription";
import Actualites from "./auth/Inscription"; // ⚠️ Vérifier ce composant
import Trock from "./trock/Trock";
import Evenements from "./section/evenements/Evenements";
import Messages from "./auth/Inscription";
import Carte from "./auth/Inscription";
import Map from "./section/carte/Carte";
import UserHeader from "./UI/head";
import Navbar from "./UI/navbar";
import ProfilePage from "./profile/Profile";
import EditUser from "./auth/Edit";
import News from "./news/News";

// Définit le basename pour React Router
const basename = '/';

// Composant pour gérer l'affichage conditionnel
function AppLayout() {
  const location = useLocation();
  const hasUserToken = sessionStorage.getItem("UserToken");
  const profileImage = sessionStorage.getItem("UserImage");
  const pseudo = sessionStorage.getItem("UserPseudo") || "Utilisateur";
  
  // Routes publiques (sans basename car useLocation le gère automatiquement)
  const isPublicRoute = location.pathname === "/" || 
                       location.pathname === "/connexion" || 
                       location.pathname === "/inscription";

  return (
    <>
      {hasUserToken && !isPublicRoute && (
        <UserHeader
          profileImage={profileImage || ""}
          pseudo={pseudo}
        />
      )}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        
        {hasUserToken ? (
          // Routes protégées (utilisateur connecté)
          <>
            <Route path="/news" element={<News />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/editprofil" element={<EditUser />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/trock" element={<Trock />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/carte" element={<Map />} />
          </>
        ) : (
          // Redirection si pas connecté
          <Route path="*" element={<Navigate to="/connexion" replace />} />
        )}
      </Routes>
      
      {hasUserToken && !isPublicRoute && <Navbar />}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <AppLayout />
    </BrowserRouter>
  </StrictMode>
);