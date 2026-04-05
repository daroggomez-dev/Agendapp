import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [modo, setModo] = useState('login');
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
    setError(''); setMensaje(''); setCargando(true);
    try {
      if (modo === 'login') { await login(email, password); navigate('/'); }
      else if (modo === 'register') { await register(email, password, nombre); navigate('/'); }
      else { await resetPassword(email); setMensaje('Te enviamos un email para recuperar tu contraseña.'); }
    } catch (err) {
      if (err.code === 'auth/user-not-found') setError('No encontramos esa cuenta.');
      else if (err.code === 'auth/wrong-password') setError('Contraseña incorrecta.');
      else if (err.code === 'auth/email-already-in-use') setError('Ese email ya está registrado.');
      else if (err.code === 'auth/weak-password') setError('La contraseña debe tener al menos 6 caracteres.');
      else setError('Ocurrió u
cat > src/pages/Auth.jsx << 'EOF'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Auth() {
  const [modo, setModo] = useState('login');
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
    setError(''); setMensaje(''); setCargando(true);
    try {
      if (modo === 'login') { await login(email, password); navigate('/'); }
      else if (modo === 'register') { await register(email, password, nombre); navigate('/'); }
      else { await resetPassword(email); setMensaje('Te enviamos un email para recuperar tu contraseña.'); }
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
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5',padding:'1rem'}}>
      <div style={{background:'white',borderRadius:16,padding:'2rem',width:'100%',maxWidth:400,boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}>
        <div style={{textAlign:'center',marginBottom:8}}><span style={{fontSize:48}}>📚</span></div>
        <h1 style={{fontSize:28,fontWeight:600,textAlign:'center',color:'#1a1a1a',margin:'0 0 4px'}}>ProfeApp</h1>
        <p style={{fontSize:15,color:'#666',textAlign:'center',marginBottom:24}}>
          {modo==='login'?'Ingresá a tu cuenta':modo==='register'?'Creá tu cuenta gratuita':'Recuperar contraseña'}
        </p>
        {error && <div style={{background:'#FCEBEB',color:'#A32D2D',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:12}}>{error}</div>}
        {mensaje && <div style={{background:'#EAF3DE',color:'#3B6D11',borderRadius:8,padding:'10px 14px',fontSize:13,marginBottom:12}}>{mensaje}</div>}
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>
          {modo==='register' && (
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              <label style={{fontSize:13,color:'#555',fontWeight:500}}>Tu nombre</label>
              <input style={{border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:15}} type="text" placeholder="Ej: María González" value={nombre} onChange={e=>setNombre(e.target.value)} required />
            </div>
          )}
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            <label style={{fontSize:13,color:'#555',fontWeight:500}}>Email</label>
            <input style={{border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:15}} type="email" placeholder="tu@email.com" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          {modo!=='reset' && (
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              <label style={{fontSize:13,color:'#555',fontWeight:500}}>Contraseña</label>
              <input style={{border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:15}} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
          )}
          <button style={{background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'12px',fontSize:15,fontWeight:600,cursor:'pointer',marginTop:4}} type="submit" disabled={cargando}>
            {cargando?'Cargando...':modo==='login'?'Ingresar':modo==='register'?'Crear cuenta':'Enviar email'}
          </button>
        </form>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,marginTop:20}}>
          {modo==='login' && <>
            <button style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:13,textDecoration:'underline'}} onClick={()=>setModo('register')}>¿No tenés cuenta? Registrate gratis</button>
            <button style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:13,textDecoration:'underline'}} onClick={()=>setModo('reset')}>Olvidé mi contraseña</button>
          </>}
          {modo!=='login' && <button style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:13,textDecoration:'underline'}} onClick={()=>setModo('login')}>← Volver al inicio de sesión</button>}
        </div>
      </div>
    </div>
  );
}
