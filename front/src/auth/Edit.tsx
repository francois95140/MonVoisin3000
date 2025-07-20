import React, { useState } from 'react';
import Inscription from './Inscription';



const EditUser = () => {
    document.getElementById("indicator")?.classList.add("filter", "opacity-0");
  setTimeout(() => {
    const list = document.getElementById("indicator").parentNode.children;
    Array.from(list).forEach((el) => el.classList.remove("active"));
  }, 1);
  return (
      <Inscription
      isInscription = {false}
      />
  );
};

export default EditUser;

