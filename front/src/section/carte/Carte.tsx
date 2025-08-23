import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
const googleMapKey = import.meta.env.VITE_MAP_KEY;

const containerStyle = {
  width: '100%',
  height: '550px'
};

const center = {
  lat: 48.8566, 
  lng: 2.3522   
};

const Cart = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey:  googleMapKey
  });

  if (!isLoaded) return <div>Chargement de la carte...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default Cart;
