import { useLocation } from 'react-router-dom';
import Inscription from './Inscription';

const EditUser = () => {
    const location = useLocation();
    const userData = location.state?.userData || {};
    
    document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const list = document.getElementById("indicator").parentNode.children;
    Array.from(list).forEach((el) => el.classList.remove("active"));
  }, 1);
  return (
      <Inscription
      isInscription = {false}
      userData = {userData}
      />
  );
};

export default EditUser;

