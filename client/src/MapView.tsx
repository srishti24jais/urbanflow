import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 28.6139, // Example: New Delhi coordinates
  lng: 77.2090,
};

const signalLocations = [
  { id: "A", lat: 28.6139, lng: 77.2090 },
  { id: "B", lat: 28.6145, lng: 77.2102 },
  { id: "C", lat: 28.6120, lng: 77.2080 },
];

const MapView: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  return (
    <LoadScript googleMapsApiKey="AIzaSyDMuSlmkGYQY20VwbSEzvQnF0F3iLC1R8o">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
        onLoad={map => setMap(map)}
      >
        {signalLocations.map(signal => (
          <Marker
            key={signal.id}
            position={{ lat: signal.lat, lng: signal.lng }}
            label={signal.id}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapView;
