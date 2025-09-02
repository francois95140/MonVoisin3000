import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
const googleMapKey = import.meta.env.VITE_MAP_KEY;

const containerStyle = {
  width: '100%',
  height: '550px'
};

const defaultCenter = {
  lat: 48.8566, 
  lng: 2.3522   
};

const Cart = () => {
  const [center, setCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapKey
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error('erreur géolocalisation:', error);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      console.log('géolocalisation non supportée');
      setLoading(false);
    }
  }, []);

  if (!isLoaded || loading) return <div>Chargement de la carte...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      <Marker position={center} />
    </GoogleMap>
  );
};

export default Cart;
