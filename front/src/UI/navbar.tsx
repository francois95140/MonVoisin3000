import "./navbar.css";
import { NavLink } from "react-router";

function Navbar() {

  return (
    <>
      <div
        className="navbar navheight border-gray-900"
      >
        <div className="navigation">
          <ul>
            <li
              className={
                "list" +
                (window.location.pathname.startsWith("/connect")
                  ? " active"
                  : "")
              }
              onClick={(e) => {
                e.preventDefault();
                const list = e.currentTarget.parentNode.children;
                Array.from(list).forEach((el) => el.classList.remove("active"));
                e.currentTarget.classList.add("active");
              }}
            >
              <NavLink to="/testa">
                <span className="icon">
                  <ion-icon name="newspaper-outline"></ion-icon>
                </span>
                <span className="text">Actu</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (window.location.pathname.startsWith("/connect")
                  ? " active"
                  : "")
              }
              onClick={(e) => {
                e.preventDefault();
                const list = e.currentTarget.parentNode.children;
                Array.from(list).forEach((el) => el.classList.remove("active"));
                e.currentTarget.classList.add("active");
              }}
            >
              <NavLink to="/testb">
                <span className="icon">
                  <ion-icon name="swap-horizontal-outline"></ion-icon>
                </span>
                <span className="text">Trock</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (window.location.pathname.startsWith("/evenements")
                  ? " active"
                  : "")
              }
              onClick={(e) => {
                e.preventDefault();
                const list = e.currentTarget.parentNode.children;
                Array.from(list).forEach((el) => el.classList.remove("active"));
                e.currentTarget.classList.add("active");
              }}
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
                (window.location.pathname.startsWith("/connect")
                  ? " active"
                  : "")
              }
              onClick={(e) => {
                e.preventDefault();
                const list = e.currentTarget.parentNode.children;
                Array.from(list).forEach((el) => el.classList.remove("active"));
                e.currentTarget.classList.add("active");
              }}
            >
              <NavLink to="/test">
                <span className="icon">
                  <ion-icon name="paper-plane-outline"></ion-icon>
                </span>
                <span className="text">Convs</span>
              </NavLink>
            </li>
            <li
              className={
                "list" +
                (window.location.pathname.startsWith("/connect")
                  ? " active"
                  : "")
              }
              onClick={(e) => {
                e.preventDefault();
                const list = e.currentTarget.parentNode.children;
                Array.from(list).forEach((el) => el.classList.remove("active"));
                e.currentTarget.classList.add("active");
              }}
            >
              <NavLink to="/test">
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
