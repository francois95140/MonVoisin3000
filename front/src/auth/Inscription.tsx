import { NavLink } from "react-router-dom";
import { FormField, TextArea, Button, IonIcon } from '../components/shared';
import { SocialButtons, Separator, AddressField, AvatarUpload } from './components';
const apiUrl = import.meta.env.VITE_API_URL;
import "./Inscription.css";
async function handleInscription(event: React.FormEvent<HTMLFormElement>, isInscription: boolean = true, initialUserData: UserData = {}) {
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
    // Gestion de l'avatar si présent
    const avatarInput = event.currentTarget.elements.namedItem("photo") as HTMLInputElement;
    const avatarFile = avatarInput?.files?.[0];
    let avatarUrl = "";

    if (avatarFile) {
      // Upload de l'avatar d'abord
      const avatarFormData = new FormData();
      avatarFormData.append("avatar", avatarFile);
      
      const avatarResponse = await fetch(`${apiUrl}/upload/avatar`, {
        method: "POST",
        body: avatarFormData,
      });
      
      if (avatarResponse.ok) {
        const avatarData = await avatarResponse.json();
        avatarUrl = avatarData.url || "";
      } else {
        console.error("Erreur lors de l'upload de l'avatar:", avatarResponse.statusText);
      }
    }

    // Préparation des headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Ajout du token d'authentification pour la modification
    if (!isInscription) {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      if (!token) {
        alert('Session expirée. Veuillez vous reconnecter.');
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
        avatar: "https://avatars.githubusercontent.com/u/94387150?v=4",
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
      if (hasChanged(formValues.adresse, initialUserData.address)) bodyData.fullAddress = formValues.adresse;
      
      // Si aucun champ n'a été modifié, informer l'utilisateur
      if (Object.keys(bodyData).length === 0) {
        alert("Aucune modification détectée.");
        return;
      }
      
      console.log("Champs modifiés:", bodyData);
    }

    // Envoi des données
    const url = isInscription ? `${apiUrl}/auth/register` : `${apiUrl}/users/me`;
    const method = isInscription ? "POST" : "PATCH";
    
    const response = await fetch(url, {
      method,
      headers,
      body: JSON.stringify({...bodyData,
        cp: bodyData.codePostal,
      }),
    });

    console.log("Response status:", response);

    if (response.ok) {
      const data = await response.json();
      console.log(isInscription ? "Inscription réussie:" : "Modification réussie:", data);
      
      if (isInscription) {
        // Redirection ou affichage d'un message de succès pour l'inscription
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
        // Optionnel: redirection vers la page de connexion
        // window.location.href = "/connexion";
      } else {
        // Message de succès pour la modification
        alert("Profil modifié avec succès !");
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
        alert('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      alert(`Erreur lors de l'${action}: ${errorData.message || 'Une erreur est survenue'}`);
    }
    
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur de connexion. Veuillez réessayer.");
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
}

function Inscription({ isInscription = true, userData = {} }: { isInscription?: boolean; userData?: UserData }) {
  return (
    <>
      <section className="text-gray-600 body-font flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold my-5">{isInscription ? "Inscription" : "Modification"}</h1>
        <div className="container px-5 py-6 mx-auto flex flex-wrap items-center justify-center">
          <form
            onSubmit={(e) => handleInscription(e, isInscription, userData)}
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

            <AvatarUpload />
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
