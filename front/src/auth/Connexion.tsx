import { NavLink } from "react-router-dom";

function Connexion() {
  return (
    <>
            <section className="text-gray-600 body-font flex flex-col justify-center items-center">
        <h1 className="text-3xl font-semibold mt-5">Connexion</h1>
        <div className="container px-5 py-6 mx-auto flex flex-wrap items-center justify-center">
          <form onSubmit={ console.log("test") } className="lg:w-2/5 md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col w-full mt-0 justify-center">
            <h2 className="text-gray-900 text-lg font-medium title-font mb-5">
              Se connecter à un compte
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
            <div className="relative mb-4">
              <label
                htmlFor="tag"
                className="leading-7 text-sm text-gray-600"
              >
                Tag ou Email
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
            <button type="submit"  className="text-white bg-indigo-500 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-600 rounded text-lg">
              Connexion
            </button>
            <div className="flex my-4">
              <NavLink to="/inscription" className="mr-2 flex-2/3 text-white bg-indigo-400 border-0 py-2 px-8 focus:outline-none hover:bg-indigo-500 rounded text-lg text-center">
                Inscription
              </NavLink>
              <NavLink to="/" className="ml-2 flex-1/3 .text-gray-700 bg-gray-200 border-0 py-2 px-8 focus:outline-none hover:bg-gray-300 rounded text-lg text-center">
                <span className="h-full flex items-center text-2xl text-center justify-center">
                  <ion-icon name="arrow-back-outline"></ion-icon>
                </span>
              </NavLink>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default Connexion;
