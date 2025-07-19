import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';

const PrivateRoute = ({ children }: { children: React.ReactElement }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>;

  // If not logged in, redirect to login
  if (!user) return <Navigate to="/" />;

  // If logged in, show the component
  return children;
};

export default PrivateRoute;
