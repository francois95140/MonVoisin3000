import React, { useState } from 'react';

interface AddressFieldProps {
  id?: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  userData?: any;
}

const AddressField: React.FC<AddressFieldProps> = ({
  id = "adresse",
  name = "adresse",
  label = "Adresse",
  defaultValue = "",
  userData = {}
}) => {
  const [rue, setRue] = useState(userData.rue || '');
  const [cp, setCp] = useState(userData.cp || userData.codePostal || '');
  const [ville, setVille] = useState(userData.ville || '');
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 3) {
      fetch(
        "https://api-adresse.data.gouv.fr/search/?q=" +
          encodeURIComponent(e.target.value) +
          "&limit=1&autocomplete=1"
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.features.length === 0) {
            const autocompleteEl = document.getElementById("adresseautocomplete");
            if (autocompleteEl) {
              autocompleteEl.innerHTML = "<p class='my-4'>Aucun résultat</p>";
            }
            return;
          } else {
            const autocompleteEl = document.getElementById("adresseautocomplete");
            if (autocompleteEl) {
              autocompleteEl.innerHTML = data.features
                .map(
                  (feature: any) =>
                    `<p class="my-4">${feature.properties.label}</p>`
                )
                .join(
                  '<hr class="border-t mx-5 border-3 border-indigo-500 my-4"/>'
                );
            }

            if (userData) {
              userData.rue = data.features[0].properties.name;
              userData.codePostal = data.features[0].properties.postcode;
              userData.ville = data.features[0].properties.city;
              userData.address = data.features[0].properties.label;
            }

            // Mise à jour des états et des champs cachés
            const newRue = data.features[0].properties.name;
            const newCp = data.features[0].properties.postcode;
            const newVille = data.features[0].properties.city;
            
            setRue(newRue);
            setCp(newCp);
            setVille(newVille);
            
            const rueInput = document.getElementById("rue") as HTMLInputElement;
            const cpInput = document.getElementById("cp") as HTMLInputElement;
            const villeInput = document.getElementById("ville") as HTMLInputElement;
            if (rueInput) rueInput.value = newRue;
            if (cpInput) cpInput.value = newCp;
            if (villeInput) villeInput.value = newVille;
          }
        });
    }
  };

  return (
    <>
      <div className="relative mb-4">
        <label
          htmlFor={id}
          className="leading-7 text-sm text-gray-600"
        >
          {label}
        </label>
        <input
          type="text"
          id={id}
          name={name}
          defaultValue={defaultValue}
          onChange={handleAddressChange}
          className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
        />
        <input type="hidden" name="rue" id="rue" value={rue} />
        <input type="hidden" name="cp" id="cp" value={cp} />
        <input type="hidden" name="ville" id="ville" value={ville} />
      </div>
      <div className="mb-4">
        <div
          id="adresseautocomplete"
          className="font-semibold w-full p-2 bg-blue-200 text-center text-gray-700 rounded"
        >
          ...
        </div>
      </div>
    </>
  );
};

export default AddressField;