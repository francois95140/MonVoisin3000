import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
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
import ChangePassword from "./profile/ChangePassword";
import { Conversations } from "./section/conversations";
import News from "./news/News";

// Définit le basename pour React Router
const basename = '/';

// Composant pour gérer l'affichage conditionnel
function AppLayout() {
  const location = useLocation();
  const hasUserToken = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
  const [profileImage, setProfileImage] = useState<string | null>(
    sessionStorage.getItem("UserImage") || localStorage.getItem("UserImage")
  );
  const [pseudo, setPseudo] = useState<string>(
    sessionStorage.getItem("UserPseudo") || localStorage.getItem("UserPseudo") || "Utilisateur"
  );

  // Récupérer les données utilisateur si elles ne sont pas en cache
  useEffect(() => {
    const fetchUserData = async () => {
      if (hasUserToken && pseudo === "Utilisateur") {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          const response = await fetch(`${apiUrl}/api/users/me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${hasUserToken}`
            }
          });
          
          if (response.ok) {
            const userData = await response.json();
            const storage = localStorage.getItem("authToken") ? localStorage : sessionStorage;
            
            const newPseudo = userData.pseudo || userData.tag || "Utilisateur";
            setPseudo(newPseudo);
            storage.setItem("UserPseudo", newPseudo);
            
            if (userData.avatar) {
              setProfileImage(userData.avatar);
              storage.setItem("UserImage", userData.avatar);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
        }
      }
    };

    fetchUserData();
  }, [hasUserToken, pseudo]);
  
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
            <Route path="/changepassword" element={<ChangePassword />} />
            <Route path="/actualites" element={<Actualites />} />
            <Route path="/trock" element={<Trock />} />
            <Route path="/evenements" element={<Evenements />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/convs" element={<Conversations />} />
            <Route path="/carte" element={<Map />} />
          </>
        ) : (
          // Redirection si pas connecté
          <Route path="*" element={<Navigate to="/connexion" replace />} />
        )}
      </Routes>
      
      {hasUserToken && !isPublicRoute && <Navbar />}
      
      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <WebSocketProvider>
        <BrowserRouter basename={basename}>
          <AppLayout />
        </BrowserRouter>
      </WebSocketProvider>
    </ThemeProvider>
  </StrictMode>
);