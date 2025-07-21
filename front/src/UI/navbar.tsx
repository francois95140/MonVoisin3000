import React, { useEffect } from "react";
import "./navbar.css";
import { NavLink, useLocation } from "react-router";

function Navbar() {
  const location = useLocation();

  useEffect(() => {
    // Si la route ne commence pas par /evenements
    if (!location.pathname.startsWith("/evenements")&&!location.pathname.startsWith("/trock")&& !location.pathname.startsWith("/news")) {
      // Enlever la classe active de tous les li
      const allListItems = document.querySelectorAll('.navigation ul li.list');
      allListItems.forEach(li => li.classList.remove('active'));
      
      // Mettre l'indicator en opacity-0
      const indicator = document.getElementById('indicator');
      if (indicator) {
        indicator.classList.add('opacity-0');
      }
    } else {
      // Si on est sur /evenements, remettre l'opacity à 1
      const indicator = document.getElementById('indicator');
      if (indicator) {
        indicator.classList.remove('opacity-0');
      }
    }
  }, [location.pathname]);

  const handleItemClick = (e) => {
    e.preventDefault();
    const list = e.currentTarget.parentNode.children;
    Array.from(list).forEach((el) => el.classList.remove("active"));
    e.currentTarget.classList.add("active");
    
    // Remettre l'opacity de l'indicator à 1 quand on clique
    const indicator = document.getElementById('indicator');
    if (indicator) {
      indicator.classList.remove('opacity-0');
    }
  };

  return (
    <>
      <div className="navbar navheight border-gray-900">
        <div className="navigation">
          <ul>
            <li
              className={
                "list" +
                (location.pathname.startsWith("/testa") ? " active" : "")
              }
              onClick={handleItemClick}
            >
              <NavLink to="/news">
                <span className="icon">
                  <ion-icon name="newspaper-outline"></ion-icon>
                </span>
                <span className="text">Actu</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (location.pathname.startsWith("/testb") ? " active" : "")
              }
              onClick={handleItemClick}
            >
              <NavLink to="/trock">
                <span className="icon">
                  <ion-icon name="swap-horizontal-outline"></ion-icon>
                </span>
                <span className="text">Trock</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (location.pathname.startsWith("/evenements") ? " active" : "")
              }
              onClick={handleItemClick}
            >
              <NavLink to="/evenements">
                <span className="icon">
                  <ion-icon name="calendar-number-outline"></ion-icon>
                </span>
                <span className="text">Events</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (location.pathname.startsWith("/convs") ? " active" : "")
              }
              onClick={handleItemClick}
            >
              <NavLink to="/convs">
                <span className="icon">
                  <ion-icon name="paper-plane-outline"></ion-icon>
                </span>
                <span className="text">Convs</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (location.pathname.startsWith("/trackmap") ? " active" : "")
              }
              onClick={handleItemClick}
            >
              <NavLink to="/trackmap">
                <span className="icon">
                  <ion-icon name="location-outline"></ion-icon>
                </span>
                <span className="text">Trackmap</span>
              </NavLink>
            </li>
            <div className="indicator" id="indicator"></div>
          </ul>
        </div>
      </div>
      <div className="navheight"></div>
    </>
  );
}

export default Navbar;