import React,{useState}from'react';
import{useNavigate}from'react-router-dom';
import{useAuth}from'../hooks/useAuth';
export default function Auth(){
const[modo,setModo]=useState('login');
const[nombre,setNombre]=useState('');
const[email,setEmail]=useState('');
const[password,setPassword]=useState('');
const[error,setError]=useState('');
const[cargando,setCargando]=useState(false);
const{login,register,resetPassword}=useAuth();
const navigate=useNavigate();
async function handleSubmit(e){
e.preventDefault();setError('');setCargando(true);
try{
if(modo==='login'){await login(email,password);navigate('/');}
else if(modo==='register'){await register(email,password,nombre);navigate('/');}
else{await resetPassword(email);alert('Email enviado');}
}catch(err){setError('Error al ingresar. Verificá tus datos.');}
setCargando(false);}
return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5',padding:'1rem'}}><div style={{background:'white',borderRadius:16,padding:'2rem',width:'100%',maxWidth:400,boxShadow:'0 2px 16px rgba(0,0,0,0.08)'}}><div style={{textAlign:'center',fontSize:48,marginBottom:8}}>📚</div><h1 style={{textAlign:'center',color:'#1a1a1a',marginBottom:4}}>ProfeApp</h1><p style={{textAlign:'center',color:'#666',marginBottom:24}}>{modo==='login'?'Ingresá a tu cuenta':modo==='register'?'Creá tu cuenta':'Recuperar contraseña'}</p>{error&&<div style={{background:'#FCEBEB',color:'#A32D2D',padding:'10px',borderRadius:8,marginBottom:12}}>{error}</div>}<form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:12}}>{modo==='register'&&<input style={{border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14}} placeholder="Tu nombre" value={nombre} onChange={e=>setNombre(e.target.value)} required/>}<input style={{border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14}} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>{modo!=='reset'&&<input style={{border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14}} type="password" placeholder="Contrasena" value={password} onChange={e=>setPassword(e.target.value)} required/>}<button style={{background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'12px',fontSize:15,fontWeight:600,cursor:'pointer'}} type="submit" disabled={cargando}>{cargando?'Cargando...':modo==='login'?'Ingresar':modo==='register'?'Crear cuenta':'Enviar email'}</button></form><div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,marginTop:20}}>{modo==='login'&&<><button style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:13}} onClick={()=>setModo('register')}>Registrate gratis</button><button style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:13}} onClick={()=>setModo('reset')}>Olvide mi contrasena</button></>}{modo!=='login'&&<button style={{background:'none',border:'none',color:'#378ADD',cursor:'pointer',fontSize:13}} onClick={()=>setModo('login')}>Volver</button>}</div></div></div>);}
