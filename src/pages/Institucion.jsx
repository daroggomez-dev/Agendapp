import React,{useState,useEffect}from'react';
import{useNavigate,useParams}from'react-router-dom';
import{collection,addDoc,getDocs,query,where,doc,getDoc}from'firebase/firestore';
import{db}from'../firebase/config';
import{useAuth}from'../hooks/useAuth';
import{generarFechasClase}from'../utils/helpers';
const DIAS=['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
export default function Institucion(){
const{id}=useParams();
const{currentUser}=useAuth();
const navigate=useNavigate();
const[institucion,setInstitucion]=useState(null);
const[cursos,setCursos]=useState([]);
const[modal,setModal]=useState(false);
const[paso,setPaso]=useState(1);
const[form,setForm]=useState({nombre:'',horario:'',diasSemana:[],fechaInicio:'2026-03-01',fechaFin:'2026-12-18'});
const[alumnos,setAlumnos]=useState('');
useEffect(()=>{cargarDatos();},[id]);
async function cargarDatos(){
const instSnap=await getDoc(doc(db,'instituciones',id));
if(instSnap.exists())setInstitucion({id:instSnap.id,...instSnap.data()});
const q=query(collection(db,'cursos'),where('instId','==',id),where('uid','==',currentUser.uid));
const snap=await getDocs(q);
setCursos(snap.docs.map(d=>({id:d.id,...d.data()})));}
function toggleDia(dia){setForm(f=>({...f,diasSemana:f.diasSemana.includes(dia)?f.diasSemana.filter(d=>d!==dia):[...f.diasSemana,dia]}));}
async function guardarCurso(){
const listaAlumnos=alumnos.split('\n').map(a=>a.trim()).filter(a=>a.length>0).map((nombre,i)=>({id:'alumno_'+i,nombre}));
const fechas=generarFechasClase(form.diasSemana,form.fechaInicio,form.fechaFin);
await addDoc(collection(db,'cursos'),{uid:currentUser.uid,instId:id,nombre:form.nombre,horario:form.horario,diasSemana:form.diasSemana,fechaInicio:form.fechaInicio,fechaFin:form.fechaFin,fechas,alumnos:listaAlumnos,creadoEn:new Date()});
setModal(false);setPaso(1);setForm({nombre:'',horario:'',diasSemana:[],fechaInicio:'2026-03-01',fechaFin:'2026-12-18'});setAlumnos('');cargarDatos();}
const iniciales=n=>n?.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2)||'??';
return(<div style={{minHeight:'100vh',background:'#f8f8f6',padding:'1rem'}}><div style={{maxWidth:680,margin:'0 auto'}}>
<div style={{display:'flex',alignItems:'center',gap:12,marginBottom:'1.5rem',paddingBottom:'1rem',borderBottom:'1px solid #eee'}}>
<button style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888',padding:0}} onClick={()=>navigate('/')}>←</button>
<div style={{width:36,height:36,borderRadius:8,background:'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
{institucion?.logo?<img src={institucion.logo} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<span style={{fontSize:14,fontWeight:600,color:'#888'}}>{iniciales(institucion?.nombre||'')}</span>}
</div>
<h2 style={{flex:1,fontSize:18,fontWeight:600,color:'#1a1a1a'}}>{institucion?.nombre}</h2>
<button style={{background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontSize:14,fontWeight:600,cursor:'pointer'}} onClick={()=>setModal(true)}>+ Curso</button>
</div>
{cursos.length===0?<div style={{textAlign:'center',padding:'3rem 1rem',color:'#aaa',fontSize:14}}>No hay cursos. Toca + Curso para agregar uno.</div>:cursos.map(curso=>(<div key={curso.id} style={{background:'white',border:'1px solid #eee',borderRadius:12,padding:'1rem 1.25rem',marginBottom:10,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}} onClick={()=>navigate('/curso/'+curso.id)}><div><div style={{fontSize:16,fontWeight:600,color:'#1a1a1a'}}>{curso.nombre}</div><div style={{fontSize:13,color:'#888',marginTop:3}}>{curso.horario} · {curso.alumnos?.length||0} alumnos</div></div><div style={{textAlign:'right'}}><div style={{fontSize:20,fontWeight:600,color:'#3B6D11'}}>-</div><div style={{fontSize:11,color:'#999'}}>asistencia</div></div></div>))}
</div>
{modal&&(<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}} onClick={()=>setModal(false)}>
<div style={{background:'white',borderRadius:16,padding:'1.5rem',width:'100%',maxWidth:440,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
{paso===1&&<><h3 style={{fontSize:17,fontWeight:600,marginBottom:'1rem'}}>Nuevo curso</h3>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Nombre del curso</label>
<input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box',marginBottom:10}} placeholder="Ej: 3 B, 4 Eco TM..." value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))}/>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Horario</label>
<input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box',marginBottom:10}} placeholder="Ej: Lun y Vie 13:00-15:00" value={form.horario} onChange={e=>setForm(f=>({...f,horario:e.target.value}))}/>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Dias de clase</label>
<div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
{DIAS.map((dia,i)=>(<button key={i} style={{border:'1px solid #ddd',borderRadius:8,padding:'6px 12px',fontSize:13,cursor:'pointer',background:form.diasSemana.includes(i)?'#378ADD':'white',color:form.diasSemana.includes(i)?'white':'#666'}} onClick={()=>toggleDia(i)} type="button">{dia}</button>))}
</div>
<div style={{display:'flex',gap:8}}>
<div style={{flex:1}}><label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Inicio</label><input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} type="date" value={form.fechaInicio} onChange={e=>setForm(f=>({...f,fechaInicio:e.target.value}))}/></div>
<div style={{flex:1}}><label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Fin</label><input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} type="date" value={form.fechaFin} onChange={e=>setForm(f=>({...f,fechaFin:e.target.value}))}/></div>
</div>
<div style={{display:'flex',gap:8,marginTop:16}}>
<button style={{flex:1,background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer'}} onClick={()=>setPaso(2)} disabled={!form.nombre||form.diasSemana.length===0}>Siguiente</button>
<button style={{flex:1,background:'none',border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14,cursor:'pointer',color:'#888'}} onClick={()=>setModal(false)}>Cancelar</button>
</div></>}
{paso===2&&<><h3 style={{fontSize:17,fontWeight:600,marginBottom:'1rem'}}>Lista de alumnos</h3>
<p style={{fontSize:13,color:'#888',marginBottom:12}}>Un alumno por linea. Podes pegar desde Excel.</p>
<textarea style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,minHeight:200,resize:'vertical',boxSizing:'border-box'}} placeholder="Bobadilla, Agustina&#10;Bohorquez, Thiago&#10;..." value={alumnos} onChange={e=>setAlumnos(e.target.value)}/>
<div style={{display:'flex',gap:8,marginTop:16}}>
<button style={{flex:1,background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer'}} onClick={guardarCurso}>Crear curso</button>
<button style={{flex:1,background:'none',border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14,cursor:'pointer',color:'#888'}} onClick={()=>setPaso(1)}>Atras</button>
</div></>}
</div>
</div>)}
</div>);}
