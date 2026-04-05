import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Auth from './pages/Auth';
import Inicio from './pages/Inicio';
import Institucion from './pages/Institucion';
import Curso from './pages/Curso';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/auth" />;
}

function PublicRoute({ children }) {
  const { currentUser } = useAuth();
  return !currentUser ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Inicio /></PrivateRoute>} />
          <Route path="/institucion/:id" element={<PrivateRoute><Institucion /></PrivateRoute>} />
          <Route path="/curso/:id" element={<PrivateRoute><Curso /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
