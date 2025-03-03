//import { useState } from 'react'
import "./App.css";

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
    <div className="navbar">
       <div className="navigation">
        <ul>
            <li className={`list${window.location.pathname.includes('/test') ? ' active' : ''}`}>
                <a href="#">
                    <span className="icon">
                        <ion-icon name="american-football-outline"></ion-icon>                </span>
                    <span className="text">Accueil</span>
                </a>
            </li>
            <li className="list">
                <a href="#">
                    <span className="icon">
                        <ion-icon name="american-football-outline"></ion-icon>                </span>
                    <span className="text">Accueil</span>
                </a>
            </li>
            <li className="list">
                <a href="#">
                    <span className="icon">
                        <ion-icon name="home-outline"></ion-icon>
                    </span>
                    <span className="text">Accueil</span>
                </a>
            </li>
            <li className="list">
                <a href="#" onClick={(e) => {e.preventDefault(); window.history.pushState({}, '', '/test'); window.dispatchEvent(new PopStateEvent('popstate'));}}>
                    <span className="icon">
                        <ion-icon name="home-outline"></ion-icon>
                    </span>
                    <span className="text">Accueil</span>
                </a>
            </li>
            <div className="indicator">

            </div>
        </ul>
    </div>
    </div>
    </>
  );
}

export default App;
