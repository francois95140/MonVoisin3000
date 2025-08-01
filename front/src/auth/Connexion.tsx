import { NavLink } from "react-router-dom";
import { FormField, Button, IonIcon } from '../components/shared';
import { SocialButtons, Separator } from './components';

const apiUrl = import.meta.env.VITE_API_URL;

async function handleConnexion(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  
  const formData = new FormData(event.currentTarget);
  
  // Récupération des valeurs du formulaire
  const formValues = {
    identifier: formData.get("tag") as string, // Tag ou Email
    password: formData.get("motdepasse") as string,
    rememberMe: formData.get("restconnecte") === "on"
  };

  console.log("Form values:", formValues);
  console.log("API URL:", apiUrl);

  try {
    // Envoi des données de connexion
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formValues.identifier,
        password: formValues.password,
        rememberMe: formValues.rememberMe
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Connexion réussie:", data);
      
      // Stockage du token si fourni
      if (data.token) {
        if (formValues.rememberMe) {
          localStorage.setItem("authToken", data.token);
        } else {
          sessionStorage.setItem("authToken", data.token);
        }
      }
      
      
      alert("Connexion réussie !");
      
      // Redirection vers la page d'accueil ou dashboard
      window.location.href = "/evenements";
      
    } else {
      const errorData = await response.json();
      console.error("Erreur lors de la connexion:", errorData);
      alert(`Erreur lors de la connexion: ${errorData.message || 'Identifiants incorrects'}`);
    }
    
  } catch (error) {
    console.error("Erreur réseau:", error);
    alert("Erreur de connexion. Veuillez réessayer.");
  }
}

function Connexion() {
  return (
    <>
            <section className="text-gray-600 body-font flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold mt-5">Connexion</h1>
        <div className="container px-5 py-6 mx-auto flex flex-wrap items-center justify-center">
          <form onSubmit={handleConnexion} className="lg:w-2/5 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col w-full mt-0 justify-center">
            <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
              Se connecter à un compte
            </h2>
            <SocialButtons />
            <Separator />
            <FormField
              id="tag"
              name="tag"
              label="Tag ou Email"
              type="text"
            />
            <FormField
              id="motdepasse"
              name="motdepasse"
              label="Mot de passe"
              type="password"
            />
            <div className="relative mb-4">
              <input
                type="checkbox"
                id="restconnecte"
                name="restconnecte"
                className="mr-2 leading-tight"
              />
              <label htmlFor="restconnecte" className="text-sm">
                Rester connecté
              </label>
            </div>
            <Button type="submit" variant="primary">
              Connexion
            </Button>
            <div className="flex my-4">
              <NavLink to="/inscription" className="mr-2 flex-2/3">
                <Button variant="secondary" className="w-full">
                  Inscription
                </Button>
              </NavLink>
              <NavLink to="/" className="ml-2 flex-1/3">
                <Button variant="ghost" className="w-full">
                  <IonIcon name="arrow-back-outline" className="text-2xl" />
                </Button>
              </NavLink>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default Connexion;
