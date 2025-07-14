// client/src/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore';

const signals = ['A', 'B', 'C'];
const states = ['green', 'yellow', 'red'];

const Dashboard: React.FC = () => {
  const [signalStates, setSignalStates] = useState<Record<string, string>>({});
  const [autoMode, setAutoMode] = useState(false);
  const [currentSignal, setCurrentSignal] = useState(0);

  useEffect(() => {
    const unsubscribes = signals.map((signal) => {
      const signalRef = doc(db, 'traffic_signals', signal);
      return onSnapshot(signalRef, (docSnap) => {
        if (docSnap.exists()) {
          setSignalStates((prev) => ({
            ...prev,
            [signal]: docSnap.data().state,
          }));
        }
      });
    });
    return () => unsubscribes.forEach((unsub) => unsub());
  }, []);

  // Auto cycling logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (autoMode) {
      interval = setInterval(() => {
        const current = signals[currentSignal];
        const nextIndex = (currentSignal + 1) % signals.length;
        const next = signals[nextIndex];

        // Turn current signal red
        setDoc(doc(db, 'traffic_signals', current), { state: 'red' });
        // Turn next signal green
        setDoc(doc(db, 'traffic_signals', next), { state: 'green' });

        setCurrentSignal(nextIndex);
      }, 5000); // change every 5 seconds
    }

    return () => clearInterval(interval);
  }, [autoMode, currentSignal]);

  const updateSignal = async (signal: string, newState: string) => {
    await setDoc(doc(db, 'traffic_signals', signal), { state: newState });
  };

  const getColorStyle = (state: string | undefined) => {
    switch (state) {
      case 'green':
        return { color: 'green', fontWeight: 'bold' };
      case 'yellow':
        return { color: 'goldenrod', fontWeight: 'bold' };
      case 'red':
        return { color: 'red', fontWeight: 'bold' };
      default:
        return {};
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>🚦 Signal Control</h2>
      <label>
        <input
          type="checkbox"
          checked={autoMode}
          onChange={() => setAutoMode(!autoMode)}
        />
        &nbsp;Auto Mode
      </label>

      {signals.map((signal) => (
        <div
          key={signal}
          style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
          }}
        >
          <h3>Signal {signal}</h3>
          <p>
            Current State:{' '}
            <span style={getColorStyle(signalStates[signal])}>
              {signalStates[signal] ?? 'Loading...'}
            </span>
          </p>
          {!autoMode && (
            <>
              <button onClick={() => updateSignal(signal, 'green')}>Green</button>{' '}
              <button onClick={() => updateSignal(signal, 'yellow')}>Yellow</button>{' '}
              <button onClick={() => updateSignal(signal, 'red')}>Red</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
