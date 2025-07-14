// client/src/App.tsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import Login from './Login';
import Dashboard from './Dashboard';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  if (!user) {
    return <Login />;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>UrbanFlow Admin Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <button onClick={handleLogout} style={{ marginBottom: '1rem' }}>
        Logout
      </button>

      <Dashboard /> {/* 🚦 Show traffic control UI */}
    </div>
  );
};

export default App;
