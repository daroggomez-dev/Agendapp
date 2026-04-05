import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [modo, setModo] = useState('login'); // login | register | reset
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      if (modo === 'login') {
        await login(email, password);
        navigate('/');
      } else if (modo === 'register') {
        await register(email, password, nombre);
        navigate('/');
      } else if (modo === 'reset') {
        await resetPassword(email);
        setMensaje('Te enviamos un email para recuperar tu contraseña.');
      }
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No encontramos esa cuenta.');
      else if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta.');
      else if (err.code === 'auth/email-already-in-use') setError('Ese email ya está registrado.');
      else if (err.code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres.');
      else setError('Ocurrió un error. Intentá de nuevo.');
    }
    setCargando(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>📚</span>
        </div>
        <h1 style={styles.titulo}>ProfeApp</h1>
        <p style={styles.subtitulo}>
          {modo === 'login' && 'Ingresá a tu cuenta'}
          {modo === 'register' && 'Creá tu cuenta gratuita'}
          {modo === 'reset' && 'Recuperar contraseña'}
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {mensaje && <div style={styles.success}>{mensaje}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {modo === 'register' && (
            <div style={styles.field}>
              <label style={styles.label}>Tu nombre</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Ej: María González"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
              />
            </div>
          )}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          {modo !== 'reset' && (
            <div style={styles.field}>
              <label style={styles.label}>Contraseña</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          <button style={styles.btnPrimary} type="submit" disabled={cargando}>
            {cargando ? 'Cargando...' :
              modo === 'login' ? 'Ingresar' :
              modo === 'register' ? 'Crear cuenta' : 'Enviar email'}
          </button>
        </form>

        <div style={styles.links}>
          {modo === 'login' && <>
            <button style={styles.link} onClick={() => setModo('register')}>
              ¿No tenés cuenta? Registrate gratis
            </button>
            <button style={styles.link} onClick={() => setModo('reset')}>
              Olvidé mi contraseña
            </button>
          </>}
          {modo !== 'login' && (
            <button style={styles.link} onClick={() => setModo('login')}>
              ← Volver al inicio de sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
    padding: '1rem',
  },
  card: {
    background: 'white',
    borderRadius: 16,
    padding: '2rem',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
  },
  logo: {
    textAlign: 'center',
    marginBottom: 8,
  },
  logoText: { fontSize: 48 },
  titulo: {
    fontSize: 28,
    fontWeight: 600,
    textAlign: 'center',
    color: '#1a1a1a',
    margin: '0 0 4px',
  },
  subtitulo: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 13, color: '#555', fontWeight: 500 },
  input: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 15,
    outline: 'none',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    background: '#378ADD',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '12px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 4,
  },
  error: {
    background: '#FCEBEB',
    color: '#A32D2D',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 12,
  },
  success: {
    background: '#EAF3DE',
    color: '#3B6D11',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 12,
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  link: {
    background: 'none',
    border: 'none',
    color: '#378ADD',
    cursor: 'pointer',
    fontSize: 13,
    textDecoration: 'underline',
    fontFamily: 'inherit',
  },
};
