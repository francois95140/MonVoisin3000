//import { useState } from 'react'
import "./Navbar.css";
import { NavLink } from "react-router"


function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
    <div className="navbar">
       <div className="navigation">
        <ul>
        <li className="list" onClick={(e) => { e.preventDefault(); const list = e.currentTarget.parentNode.children; Array.from(list).forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active');}}>
        <NavLink to="/testa">
                    <span className="icon">
                        <ion-icon name="american-football-outline"></ion-icon>                </span>
                    <span className="text">Accueil</span>
                </NavLink>
            </li>
            <li className="list" onClick={(e) => { e.preventDefault(); const list = e.currentTarget.parentNode.children; Array.from(list).forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active');}}>
                <NavLink to="/testb">
                    <span className="icon">
                        <ion-icon name="american-football-outline"></ion-icon>
                        </span>
                    <span className="text">Accueil</span>
                </NavLink>
            </li>
            <li className="list" onClick={(e) => {e.preventDefault(); const list = e.currentTarget.parentNode.children; Array.from(list).forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active');}}>
                <NavLink to="/">
                    <span className="icon">
                        <ion-icon name="home-outline"></ion-icon>
                    </span>
                    <span className="text">Accueil</span>
                </NavLink>
            </li>
            <li className="list" onClick={(e) => { e.preventDefault(); const list = e.currentTarget.parentNode.children; Array.from(list).forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active');}}>
                <NavLink to="/test">
                    <span className="icon">
                        <ion-icon name="home-outline"></ion-icon>
                    </span>
                    <span className="text">Accueil</span>
                </NavLink>
            </li>
            <li className="list" onClick={(e) => { e.preventDefault(); const list = e.currentTarget.parentNode.children; Array.from(list).forEach(el => el.classList.remove('active')); e.currentTarget.classList.add('active');}}>
                <NavLink to="/test">
                    <span className="icon">
                        <ion-icon name="home-outline"></ion-icon>
                    </span>
                    <span className="text">Accueil</span>
                </NavLink>
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
