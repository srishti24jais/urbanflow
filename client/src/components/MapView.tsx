import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Fix leaflet marker icons
const redIconUrl = '/assests/marker-icon-2x-red.png';
const yellowIconUrl = '/assests/marker-icon-2x-yellow.png';
const greenIconUrl = '/assests/marker-icon-2x-green.png';
const blueIconUrl = '/assests/marker-icon-2x-blue.png';
const shadowUrl = '/assests/marker-shadow.png';


const createSignalIcon = (color: 'red' | 'yellow' | 'green') =>
  new L.Icon({
    iconUrl:
      color === 'red'
        ? redIconUrl
        : color === 'yellow'
        ? yellowIconUrl
        : greenIconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });


const userIcon = new L.Icon({
  iconUrl: blueIconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Signal {
  id: string;
  lat: number;
  lng: number;
}

const MapView: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [signalStates, setSignalStates] = useState<Record<string, string>>({});
  const [signals, setSignals] = useState<Signal[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        setSignals([
          { id: 'A', lat: latitude + 0.001, lng: longitude + 0.001 },
          { id: 'B', lat: latitude + 0.002, lng: longitude - 0.001 },
          { id: 'C', lat: latitude - 0.0015, lng: longitude + 0.002 },
        ]);
      },
      (err) => {
        console.error('Error fetching location:', err);
        setUserLocation([20.5937, 78.9629]);
      }
    );

    const unsubscribes = ['A', 'B', 'C'].map((id) =>
      onSnapshot(doc(db, 'signals', id), (snapshot) => {
        const data = snapshot.data();
        if (data?.state) {
          setSignalStates((prev) => ({ ...prev, [id]: data.state }));
        }
      })
    );

    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  const SetViewOnUser = () => {
    const map = useMap();
    useEffect(() => {
      if (userLocation) {
        map.setView(userLocation, 16);
      }
    }, [userLocation]);
    return null;
  };

  const ResizeHandler = () => {
    const map = useMapEvent('resize', () => {
      map.invalidateSize();
    });

    useEffect(() => {
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }, []);

    return null;
  };

  return (
    <div style={{ height: '500px', width: '100%', marginTop: '1rem' }}>
      {userLocation && (
        <MapContainer
          center={userLocation}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-container"
        >
          <ResizeHandler />
          <SetViewOnUser />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          <Marker position={userLocation} icon={userIcon}>
            <Popup>You are here</Popup>
          </Marker>

          {signals.map(({ id, lat, lng }) => (
            <Marker
              key={id}
              position={[lat, lng]}
              icon={createSignalIcon((signalStates[id] as 'red' | 'yellow' | 'green') || 'red')}
            >
              <Popup>
                Signal {id} — State: {signalStates[id] || 'unknown'}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
};

export default MapView;
