import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import MapView from '../components/MapView'; // ✅ Correct path for Vite setup

interface SignalState {
  [key: string]: string;
}

const Dashboard: React.FC = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [autoMode, setAutoMode] = useState(false);
  const [signalStates, setSignalStates] = useState<SignalState>({
    A: 'red',
    B: 'red',
    C: 'red',
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    const unsubSignals = ['A', 'B', 'C'].map((signal) =>
      onSnapshot(doc(db, 'signals', signal), (docSnap) => {
        const data = docSnap.data();
        if (data?.state) {
          setSignalStates((prev) => ({
            ...prev,
            [signal]: data.state,
          }));
        }
      })
    );

    const unsubAuto = onSnapshot(doc(db, 'settings', 'mode'), (docSnap) => {
      const data = docSnap.data();
      setAutoMode(data?.auto || false);
    });

    return () => {
      unsubscribe();
      unsubSignals.forEach((unsub) => unsub());
      unsubAuto();
    };
  }, []);

  const handleStateChange = async (signal: string, newState: string) => {
    await setDoc(doc(db, 'signals', signal), {
      state: newState,
    });
  };

  const handleAutoModeToggle = async () => {
    const newMode = !autoMode;
    setAutoMode(newMode);
    await setDoc(doc(db, 'settings', 'mode'), {
      auto: newMode,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial' }}>
      <h1>UrbanFlow Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>

      <hr />

      {/* 🗺️ Google Map Replacement View (Leaflet) */}
      <h2>🗺️ Map View</h2>
      <MapView />

      <h2 style={{ marginTop: '2rem' }}>🚦 Signal Control</h2>
      <label>
        <input type="checkbox" checked={autoMode} onChange={handleAutoModeToggle} />
        Auto Mode
      </label>

      {['A', 'B', 'C'].map((signal) => (
        <div key={signal} style={{ border: '1px solid #ccc', padding: '1rem', margin: '1rem 0' }}>
          <h3>Signal {signal}</h3>
          <p>
            Current State:{' '}
            <span style={{ color: signalStates[signal] }}>{signalStates[signal]}</span>
          </p>
          <button onClick={() => handleStateChange(signal, 'green')}>Green</button>
          <button onClick={() => handleStateChange(signal, 'yellow')}>Yellow</button>
          <button onClick={() => handleStateChange(signal, 'red')}>Red</button>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
