import { BrowserRouter, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider, useWebSocket } from './contexts/WebSocketContext';
import PWAInstallPrompt from './components/shared/PWAInstallPrompt';
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
import { Conversations, NewConversations } from "./section/conversations";
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // WebSocket global pour les notifications
  const { connect, isConnected } = useWebSocket();

  // Récupérer les données utilisateur si elles ne sont pas en cache
  useEffect(() => {
    const fetchUserData = async () => {
      if (hasUserToken && (pseudo === "Utilisateur" || !currentUserId)) {
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
            
            // Stocker l'ID utilisateur pour la connexion WebSocket
            console.log('🔍 User ID récupéré dans main.tsx:', userData.id);
            setCurrentUserId(userData.id);
          } else if (response.status === 401) {
            // Token invalide
            localStorage.removeItem("authToken");
            sessionStorage.removeItem("authToken");
            window.location.href = "/connexion";
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
        }
      }
    };

    fetchUserData();
  }, [hasUserToken, pseudo, currentUserId]);
  
  // Connexion WebSocket globale dès que l'utilisateur est identifié
  useEffect(() => {
    console.log('🔍 Debug WebSocket global:', { 
      currentUserId, 
      hasUserToken: !!hasUserToken, 
      isConnected 
    });
    
    if (currentUserId && hasUserToken && !isConnected) {
      console.log('🔌 Connexion WebSocket GLOBALE pour:', currentUserId);
      connect(currentUserId);
    } else if (!currentUserId) {
      console.log('❌ Pas de currentUserId pour connexion WebSocket');
    } else if (!hasUserToken) {
      console.log('❌ Pas de token pour connexion WebSocket');  
    } else if (isConnected) {
      console.log('✅ WebSocket déjà connecté');
    }
  }, [currentUserId, hasUserToken, isConnected, connect]);
  
  // Système de notifications JavaScript natif
  useEffect(() => {
    // Demander permission pour les notifications
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Permission notifications:', permission);
      });
    }
    
    // Écouter les nouveaux messages pour les notifications
    const handleNewMessage = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, message, conversation } = customEvent.detail;
      
      if (type === 'newMessage' && message.senderId !== currentUserId) {
        // Notification native JavaScript
        if ('Notification' in window && Notification.permission === 'granted') {
          const notification = new Notification(
            `Nouveau message de ${conversation.name || 'Inconnu'}`, 
            {
              body: message.content,
              icon: '/favicon.ico', // ou une icône personnalisée
              badge: '/favicon.ico',
              tag: `message-${message._id}`,
              requireInteraction: false,
              silent: false
            }
          );
          
          // Fermer auto après 5 secondes
          setTimeout(() => notification.close(), 5000);
          
          // Clic sur la notification -> aller aux conversations
          notification.onclick = () => {
            window.focus();
            window.location.href = '/convs';
            notification.close();
          };
        }
        
        // Son de notification (optionnel)
        const audio = new Audio('/notification.mp3'); // Ajouter un fichier son si nécessaire
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore les erreurs si pas de son
        
        console.log('🔔 Notification:', message.content);
      }
    };

    const handleUserStatusChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { userId, isOnline } = customEvent.detail;
      console.log('👤 Statut utilisateur global:', userId, isOnline ? 'en ligne' : 'hors ligne');
    };

    window.addEventListener('conversationUpdate', handleNewMessage as EventListener);
    window.addEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('conversationUpdate', handleNewMessage as EventListener);
      window.removeEventListener('userStatusChanged', handleUserStatusChange as EventListener);
    };
  }, [currentUserId]);
  
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
            <Route path="/convs" element={<NewConversations />} />
            <Route path="/carte" element={<Map />} />
          </>
        ) : (
          // Redirection si pas connecté
          <Route path="*" element={<Navigate to="/connexion" replace />} />
        )}
      </Routes>
      
      {hasUserToken && !isPublicRoute && <Navbar />}
      
      {/* PWA Install Prompt */}
      {hasUserToken && !isPublicRoute && <PWAInstallPrompt />}
      
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