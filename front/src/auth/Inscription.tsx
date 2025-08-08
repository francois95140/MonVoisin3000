import React, { useState } from 'react';
import { NavLink, useNavigate } from "react-router-dom";
import { FormField, TextArea, Button, IonIcon } from '../components/shared';
import { SocialButtons, Separator, AddressField, AvatarUpload } from './components';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL;
import "./Inscription.css";
async function handleInscription(event: React.FormEvent<HTMLFormElement>, isInscription: boolean = true, initialUserData: UserData = {}, navigate?: (path: string) => void, avatarBase64?: string) {
  event.preventDefault();
  
  const formData = new FormData(event.currentTarget);
  
  // Récupération des valeurs du formulaire avec les bons noms de champs
  const formValues = {
    tag: formData.get("tag") as string,
    email: formData.get("email") as string,
    password: formData.get("motdepasse") as string, // Le champ s'appelle "motdepasse" dans le HTML
    pseudo: formData.get("pseudo") as string,
    bio: formData.get("bio") as string,
    phoneNumber: formData.get("tel") as string, // Le champ s'appelle "tel" dans le HTML
    rue: formData.get("rue") as string,
    codePostal: formData.get("cp") as string,
    ville: formData.get("ville") as string,
    adresse: formData.get("adresse") as string
  };
  console.log("url: ", apiUrl);
  console.log("Form values:", formValues);


  try {

    // Préparation des headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Ajout du token d'authentification pour la modification
    if (!isInscription) {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Préparation du body selon le mode
    let bodyData: any;
    
    if (isInscription) {
      // Pour l'inscription, envoyer toutes les données
      bodyData = {
        tag: formValues.tag,
        email: formValues.email,
        password: formValues.password,
        pseudo: formValues.pseudo,
        avatar: avatarBase64 || "https://avatars.githubusercontent.com/u/94387150?v=4",
        bio: formValues.bio,
        phoneNumber: formValues.phoneNumber,
        quartier: "quartier",
        rue: formValues.rue,
        cp: formValues.codePostal,
        fullAddress: formValues.adresse
      };
    } else {
      // Pour la modification, ne envoyer que les champs modifiés
      bodyData = {};
      
      // Fonction pour comparer les valeurs en traitant null, undefined et chaînes vides comme équivalentes
      const hasChanged = (newValue: string, oldValue: string | undefined) => {
        const normalizeValue = (val: string | undefined | null) => val || '';
        return normalizeValue(newValue) !== normalizeValue(oldValue);
      };
      
      // Comparaison et ajout des champs modifiés
      if (hasChanged(formValues.tag, initialUserData.tag)) bodyData.tag = formValues.tag;
      if (hasChanged(formValues.email, initialUserData.email)) bodyData.email = formValues.email;
      if (hasChanged(formValues.pseudo, initialUserData.pseudo)) bodyData.pseudo = formValues.pseudo;
      if (hasChanged(formValues.bio, initialUserData.bio)) bodyData.bio = formValues.bio;
      if (hasChanged(formValues.phoneNumber, initialUserData.phone)) bodyData.phoneNumber = formValues.phoneNumber;
      if (hasChanged(formValues.rue, initialUserData.rue)) bodyData.rue = formValues.rue;
      if (hasChanged(formValues.codePostal, initialUserData.codePostal)) bodyData.cp = formValues.codePostal;
      if (hasChanged(formValues.ville, initialUserData.ville)) bodyData.ville = formValues.ville;
      if (hasChanged(formValues.adresse, initialUserData.address)) bodyData.address = formValues.adresse;
      
      // Vérification de l'avatar modifié
      if (avatarBase64 && avatarBase64.trim() !== '') {
        bodyData.avatar = avatarBase64;
      }
      
      // Si aucun champ n'a été modifié, informer l'utilisateur
      if (Object.keys(bodyData).length === 0) {
        toast.info("Aucune modification détectée.");
        return;
      }
      
      console.log("Champs modifiés:", bodyData);
    }

    // Envoi des données
    const url = isInscription ? `${apiUrl}/api/auth/register` : `${apiUrl}/api/users/me`;
    const method = isInscription ? "POST" : "PATCH";
    
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify(bodyData),
    });

    console.log("Response status:", response);

    if (response.ok) {
      const data = await response.json();
      console.log(isInscription ? "Inscription réussie:" : "Modification réussie:", data);
      
      if (isInscription) {
        // Redirection automatique vers la page de connexion avec l'email
        toast.success("Inscription réussie ! Redirection vers la connexion...");
        if (navigate) {
          setTimeout(() => {
            navigate(`/connexion?email=${encodeURIComponent(formValues.email)}`);
          }, 1500); // Délai pour laisser le temps de voir le toast
        }
      } else {
        // Message de succès pour la modification
        toast.success("Profil modifié avec succès !");
        
        // Mettre à jour les données utilisateur en cache
        const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage;
        if (formValues.pseudo) {
          storage.setItem('UserPseudo', formValues.pseudo);
        }
        if (avatarBase64) {
          storage.setItem('UserImage', avatarBase64);
        }
        
        // Optionnel: redirection vers le profil
        // window.location.href = "/profile";
      }
      
    } else {
      const errorData = await response.json();
      const action = isInscription ? "inscription" : "modification";
      console.error(`Erreur lors de l'${action}:`, errorData);
      
      if (response.status === 401 && !isInscription) {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      // Gestion spécifique des erreurs de validation
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Afficher chaque erreur de validation
        errorData.errors.forEach((error: any) => {
          const field = error.path ? error.path.join('.') : 'Champ';
          toast.error(`${field}: ${error.message}`);
        });
      } else {
        // Erreur générale
        toast.error(`Erreur lors de l'${action}: ${errorData.message || 'Une erreur est survenue'}`);
      }
    }
    
  } catch (error) {
    console.error("Erreur réseau:", error);
    toast.error("Erreur de connexion. Veuillez réessayer.");
  }
}

interface UserData {
  pseudo?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  tag?: string;
  rue?: string;
  codePostal?: string;
  ville?: string;
  avatar?: string;
}

function Inscription({ isInscription = true, userData = {} }: { isInscription?: boolean; userData?: UserData }) {
  const navigate = useNavigate();
  const [avatarBase64, setAvatarBase64] = useState<string>('');
  
  const handleAvatarChange = (base64: string) => {
    setAvatarBase64(base64);
  };
  
  return (
    <>
      <section className="text-gray-600 body-font flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold my-5">{isInscription ? "Inscription" : "Modification"}</h1>
        <div className="container px-5 py-6 mx-auto flex flex-wrap items-center justify-center">
          <form
            onSubmit={(e) => handleInscription(e, isInscription, userData, navigate, avatarBase64)}
            className="lg:w-2/5 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col w-full mt-0 justify-center"
          >
            <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
              {isInscription ? "Créer un compte" : "Modifier mon compte"}
            </h2>
            {isInscription && (
              <>
                <SocialButtons />
                <Separator />
              </>
            )}

            <AvatarUpload 
              onChange={handleAvatarChange} 
              defaultImage={userData.avatar || ''}
            />
            <p className="text-xs text-muted-foreground p-2 m-4">
              Les champs marqués d'un * sont obligatoires
            </p>
            <FormField
              id="pseudo"
              name="pseudo"
              label="Pseudo"
              defaultValue={userData.pseudo || ''}
            />
            <FormField
              id="tag"
              name="tag"
              label="Tag"
              defaultValue={userData.tag || ''}
            />
            <FormField
              id="tel"
              name="tel"
              label="Tel."
              type="tel"
              defaultValue={userData.phone || ''}
            />
            <FormField
              id="email"
              name="email"
              label="Email"
              type="email"
              defaultValue={userData.email || ''}
            />
            <AddressField
              defaultValue={userData.address || ''}
              userData={userData}
            />
            <TextArea
              id="bio"
              name="bio"
              label="Bio"
              defaultValue={userData.bio || ''}
              maxLength={700}
            />
            {isInscription && (
              <FormField
                id="motdepasse"
                name="motdepasse"
                label="Mot de passe"
                type="password"
                required
              />
            )}
            <Button type="submit" variant="primary">
              {isInscription ? "Inscription" : "Modification"}
            </Button>
            {isInscription && (
              <div className="flex my-4">
                <NavLink to="/connexion" className="mr-2 flex-2/3">
                  <Button variant="secondary" className="w-full">
                    Connexion
                  </Button>
                </NavLink>
                <NavLink to="/" className="ml-2 flex-1/3">
                  <Button variant="ghost" className="w-full">
                    <IonIcon name="arrow-back-outline" className="text-2xl" />
                  </Button>
                </NavLink>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-3">
              Lors de l'inscription, vous acceptez nos Conditions d'utilisation
              et notre Politique de confidentialité
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

export default Inscription;
