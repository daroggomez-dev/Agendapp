import React,{useState,useEffect}from'react';
import{useNavigate}from'react-router-dom';
import{collection,addDoc,getDocs,query,where}from'firebase/firestore';
import{db}from'../firebase/config';
import{useAuth}from'../hooks/useAuth';
export default function Inicio(){
const{currentUser,userData,logout}=useAuth();
const[instituciones,setInstituciones]=useState([]);
const[modal,setModal]=useState(false);
const[nombreInst,setNombreInst]=useState('');
const[logoBase64,setLogoBase64]=useState(null);
const[logoPreview,setLogoPreview]=useState(null);
const[cargando,setCargando]=useState(true);
const navigate=useNavigate();
const nombre=userData?.nombre||currentUser?.displayName||'Profe';
const saludo=()=>{const h=new Date().getHours();if(h<12)return'Buenos días';if(h<19)return'Buenas tardes';return'Buenas noches';};
const iniciales=n=>n.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2);
useEffect(()=>{cargarInstituciones();},[]);
async function cargarInstituciones(){setCargando(true);const q=query(collection(db,'instituciones'),where('uid','==',currentUser.uid));const snap=await getDocs(q);setInstituciones(snap.docs.map(d=>({id:d.id,...d.data()})));setCargando(false);}
function handleLogo(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=(ev)=>{setLogoPreview(ev.target.result);setLogoBase64(ev.target.result);};reader.readAsDataURL(file);}
async function guardarInstitucion(){if(!nombreInst.trim())return;await addDoc(collection(db,'instituciones'),{uid:currentUser.uid,nombre:nombreInst.trim(),logo:logoBase64||null,creadoEn:new Date()});setNombreInst('');setLogoPreview(null);setLogoBase64(null);setModal(false);cargarInstituciones();}
return(<div style={{minHeight:'100vh',background:'#f8f8f6',padding:'1rem'}}><div style={{maxWidth:680,margin:'0 auto'}}>
<div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem',paddingBottom:'1rem',borderBottom:'1px solid #eee'}}>
<div style={{width:48,height:48,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:600,color:'#185FA5'}}>{iniciales(nombre)}</div>
<div style={{flex:1}}><div style={{fontSize:17,fontWeight:600}}>{saludo()}, {nombre.split(' ')[0]}</div><div style={{fontSize:13,color:'#888'}}>{instituciones.length} institución{instituciones.length!==1?'es':''}</div></div>
<button style={{background:'none',border:'1px solid #ddd',borderRadius:8,padding:'6px 12px',fontSize:13,cursor:'pointer',color:'#888'}} onClick={logout}>Salir</button>
</div>
<div style={{fontSize:11,fontWeight:600,color:'#999',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:14}}>Mis instituciones</div>
<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:14}}>
{instituciones.map(inst=>(<div key={inst.id} style={{background:'white',border:'1px solid #eee',borderRadius:16,padding:'1.25rem 1rem',cursor:'pointer',textAlign:'center'}} onClick={()=>navigate('/institucion/'+inst.id)}>
<div style={{width:72,height:72,borderRadius:12,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',background:'#f5f5f5'}}>
{inst.logo?<img src={inst.logo} alt={inst.nombre} style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<div style={{fontSize:22,fontWeight:600,color:'#888'}}>{iniciales(inst.nombre)}</div>}
</div>
<div style={{fontSize:14,fontWeight:600,color:'#1a1a1a'}}>{inst.nombre}</div>
</div>))}
<div style={{background:'none',border:'1.5px dashed #ddd',borderRadius:16,padding:'1.25rem 1rem',cursor:'pointer',textAlign:'center'}} onClick={()=>setModal(true)}>
<div style={{width:72,height:72,borderRadius:12,margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f5',fontSize:32,color:'#aaa'}}>+</div>
<div style={{fontSize:14,color:'#aaa'}}>Agregar institución</div>
</div>
</div>
</div>
{modal&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}} onClick={()=>setModal(false)}>
<div style={{background:'white',borderRadius:16,padding:'1.5rem',width:'100%',maxWidth:420}} onClick={e=>e.stopPropagation()}>
<h3 style={{fontSize:17,fontWeight:600,marginBottom:'1rem'}}>Nueva institución</h3>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Nombre</label>
<input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} placeholder="Ej: Colegio San Martín..." value={nombreInst} onChange={e=>setNombreInst(e.target.value)}/>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5,marginTop:12}}>Logo <span style={{fontSize:11,color:'#bbb'}}>opcional</span></label>
<div style={{border:'1.5px dashed #ddd',borderRadius:8,padding:'1.5rem',textAlign:'center',cursor:'pointer',color:'#aaa',fontSize:13,minHeight:80,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>document.getElementById('file-logo').click()}>
{logoPreview?<img src={logoPreview} alt="preview" style={{height:60,objectFit:'contain'}}/>:<span>Tocá para subir imagen</span>}
<input id="file-logo" type="file" accept="image/*" style={{display:'none'}} onChange={handleLogo}/>
</div>
<div style={{display:'flex',gap:8,marginTop:16}}>
<button style={{flex:1,background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer'}} onClick={guardarInstitucion}>Guardar</button>
<button style={{flex:1,background:'none',border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14,cursor:'pointer',color:'#888'}} onClick={()=>setModal(false)}>Cancelar</button>
</div>
</div>
</div>)}
</div>);
}
