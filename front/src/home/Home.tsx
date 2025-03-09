import { NavLink } from "react-router-dom";

function HomePage() {
  return (
    <>
      <section className="h-screen text-gray-600 body-font">
        <div className="h-full container mx-auto flex items-center justify-center px-5 py-6 md:flex-row flex-col">
          <div className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6 mb-10 md:mb-0">
            <img
              className="object-cover object-center rounded"
              alt="hero"
              src="https://dummyimage.com/720x600"
            />
          </div>
          <div className="lg:flex-grow md:w-1/2 lg:pl-24 md:pl-16 flex flex-col md:items-start md:text-left items-center text-center">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              MonVoisin
            <span className="inline-block lg:hidden"> &nbsp;-&nbsp; </span>
              <br className="hidden lg:inline-block" />
               3000
            </h1>
            <p className="mb-8 leading-relaxed">
              Découvrez MonVoisin 3000, 
              une application innovante qui vous permet de suivre les événements locaux, 
              de participer à des échanges de services et de troc entre voisins, 
              et de favoriser une meilleure interaction au sein de votre communauté.
            </p>
            <div className="flex justify-center">
              <NavLink
                to="/connexion"
                className="inline-flex text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
              >
                Connexion
              </NavLink>
              <NavLink
                to="/inscription"
                className="ml-4 inline-flex text-gray-700 bg-gray-100 border-0 py-2 px-6 focus:outline-none hover:bg-gray-200 rounded text-lg"
              >
                Inscription
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;
