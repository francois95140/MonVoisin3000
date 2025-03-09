import { NavLink } from "react-router-dom";
function handleInscription(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const formValues = Object.fromEntries(formData.entries());

  console.log("Form values:", formValues);

  fetch("http://localhost:3001/inscription", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formValues),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Server response:", data);
    });

}


function Inscription() {
  return (
    <>
      <section className="text-gray-600 body-font flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold mt-5">Inscription</h1>
        <div className="container px-5 py-6 mx-auto flex flex-wrap items-center justify-center">
          <form onSubmit={handleInscription} className="lg:w-2/5 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col w-full mt-0 justify-center">
            <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
              Créer un compte
            </h2>
            <div className="grid grid-cols-2 gap-6 my-4">
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <ion-icon name="logo-github" className="text-2xl"></ion-icon>
                GitHub
              </button>
              <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                <ion-icon name="logo-google" className="text-2xl"></ion-icon>
                Google
              </button>
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-100 px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>


            <div className="relative mb-4 flex justify-center">
              <div className="h-32 w-32 bg-indigo-500 overflow-hidden rounded-full">
                <input
                  type="file"
                  id="photo"
                  name="photo"
                  className="opacity-0 h-full w-full"
                />
                <ion-icon
                  name="camera"
                  className="text-6xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                ></ion-icon>
              </div>
            </div>
            <p className="text-xs text-muted-foreground p-2 m-4">Les champs marqués d'un * sont obligatoires</p>
            <div className="relative mb-4">
              <label
                htmlFor="pseudo"
                className="leading-7 text-sm text-gray-600"
              >
                Pseudo
              </label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="tag"
                className="leading-7 text-sm text-gray-600"
              >
                Tag
              </label>
              <input
                type="text"
                id="tag"
                name="tag"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="tel"
                className="leading-7 text-sm text-gray-600"
              >
                Tel.
              </label>
              <input
                type="tel"
                id="tel"
                name="tel"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="email"
                className="leading-7 text-sm text-gray-600"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="adresse"
                className="leading-7 text-sm text-gray-600"
              >
                Adresse
              </label>
              <input
                type="text"
                id="adresse"
                name="adresse"
                onChange={(e) => {
                  if (e.target.value.length > 3) {
                  fetch("https://api-adresse.data.gouv.fr/search/?q=" + encodeURIComponent(e.target.value)+ "&limit=1&autocomplete=1")
                    .then(response => response.json())
                    .then(data => {
                      if (data.features.length === 0) {
                        document.getElementById("adresseautocomplete").innerHTML = "<p class='my-4'>Aucun résultat</p>";
                        return;
                      }
                      else {
                      document.getElementById("adresseautocomplete").innerHTML = data.features.map(feature => `<p class="my-4">${feature.properties.label}</p>`).join('<hr class="border-t mx-5 border-3 border-indigo-500 my-4"/>');
                      }
                    });
                  }
                }
                }
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            
            </div>
            <div className="mb-4">
              <div id="adresseautocomplete" className="font-semibold w-full p-2 bg-indigo-200 text-center">...</div>
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="bio"
                className="leading-7 text-sm text-gray-600"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                maxLength={700}
              ></textarea>
            </div>
            <div className="relative mb-4">
              <label
                htmlFor="motdepasse"
                className="leading-7 text-sm text-gray-600"
              >
                Mot de passe
              </label>
              <input
                type="password"
                id="motdepasse"
                name="motdepasse"
                className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              />
            </div>
            <button type="submit"  className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Inscription
            </button>
            <div className="flex my-4">
              <NavLink to="/connexion" className="mr-2 flex-2/3 text-white bg-indigo-400 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-500 rounded text-lg">
                Connexion
              </NavLink>
              <NavLink to="/" className="ml-2 flex-1/3 .text-gray-700 bg-gray-200 border-0 py-2 px-8 focus:outline-none hover:bg-gray-300 rounded text-lg">
                <span className="h-full flex items-center text-2xl">
                  <ion-icon name="arrow-back-outline"></ion-icon>
                </span>
              </NavLink>
            </div>
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
