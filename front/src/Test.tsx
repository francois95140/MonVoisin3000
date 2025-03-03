//import { useState } from 'react'
import "./App.css";

function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
    <div style={{flex: 1, position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "--clr"}}>
        
    </div>
    <div className="navbar">
       <div className="navigation">
        <ul>
            <li className="list active">
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
                <a href="#">
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
