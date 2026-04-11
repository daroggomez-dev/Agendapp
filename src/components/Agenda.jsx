import React,{useState,useEffect}from'react';
import{collection,addDoc,getDocs,query,where,deleteDoc,doc}from'firebase/firestore';
import{db}from'../firebase/config';
const TIPOS=[{id:'evaluacion',label:'Evaluacion',bg:'#FCEBEB',color:'#A32D2D'},{id:'tp',label:'Trabajo practico',bg:'#E1F5EE',color:'#085041'},{id:'entrega',label:'Entrega',bg:'#FAEEDA',color:'#854F0B'},{id:'otro',label:'Otro',bg:'#f5f5f5',color:'#888'}];
export default function Agenda({cursoId}){
const[eventos,setEventos]=useState([]);
const[modal,setModal]=useState(false);
const[form,setForm]=useState({titulo:'',fecha:'',tipo:'evaluacion',descripcion:''});
const[guardando,setGuardando]=useState(false);
useEffect(()=>{cargarEventos();},[cursoId]);
async function cargarEventos(){const q=query(collection(db,'eventos'),where('cursoId','==',cursoId));const snap=await getDocs(q);const evs=snap.docs.map(d=>({id:d.id,...d.data()}));evs.sort((a,b)=>a.fecha.localeCompare(b.fecha));setEventos(evs);}
async function guardar(){if(!form.titulo||!form.fecha)return;setGuardando(true);await addDoc(collection(db,'eventos'),{cursoId,...form,creadoEn:new Date()});setGuardando(false);setModal(false);setForm({titulo:'',fecha:'',tipo:'evaluacion',descripcion:''});cargarEventos();}
async function eliminar(id){if(!window.confirm('Eliminar?'))return;await deleteDoc(doc(db,'eventos',id));cargarEventos();}
const porMes={};
eventos.forEach(ev=>{const mes=new Date(ev.fecha+'T12:00:00').toLocaleDateString('es-AR',{month:'long',year:'numeric'});if(!porMes[mes])porMes[mes]=[];porMes[mes].push(ev);});
return(
<div>
<div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1rem'}}>
<button style={{background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'8px 16px',fontSize:14,fontWeight:600,cursor:'pointer'}} onClick={()=>setModal(true)}>+ Nuevo evento</button>
</div>
{eventos.length===0?<div style={{textAlign:'center',padding:'3rem 1rem',color:'#aaa',fontSize:14}}>No hay eventos cargados.</div>:Object.entries(porMes).map(([mes,evs])=>(
<div key={mes}>
<div style={{fontSize:11,fontWeight:600,color:'#999',textTransform:'uppercase',letterSpacing:'0.05em',margin:'1.25rem 0 10px'}}>{mes.charAt(0).toUpperCase()+mes.slice(1)}</div>
{evs.map(ev=>{const tipo=TIPOS.find(t=>t.id===ev.tipo)||TIPOS[3];const fecha=new Date(ev.fecha+'T12:00:00');return(
<div key={ev.id} style={{background:'white',border:'1px solid #eee',borderRadius:12,padding:'12px 14px',marginBottom:10,display:'flex',alignItems:'flex-start',gap:12}}>
<div style={{textAlign:'center',background:'#f5f5f5',borderRadius:8,padding:'6px 10px',minWidth:44,flexShrink:0}}>
<div style={{fontSize:20,fontWeight:700,color:'#1a1a1a',lineHeight:1}}>{fecha.getDate()}</div>
<div style={{fontSize:11,color:'#888',textTransform:'uppercase'}}>{fecha.toLocaleDateString('es-AR',{month:'short'})}</div>
</div>
<div style={{flex:1}}>
<div style={{fontSize:14,fontWeight:600,color:'#1a1a1a',marginBottom:3}}>{ev.titulo}</div>
{ev.descripcion&&<div style={{fontSize:12,color:'#888',marginBottom:5}}>{ev.descripcion}</div>}
<span style={{display:'inline-block',fontSize:11,fontWeight:600,padding:'2px 8px',borderRadius:6,background:tipo.bg,color:tipo.color}}>{tipo.label}</span>
</div>
<button style={{background:'none',border:'none',color:'#ccc',cursor:'pointer',fontSize:14,padding:0}} onClick={()=>eliminar(ev.id)}>x</button>
</div>);})}
</div>))}
{modal&&<div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}} onClick={()=>setModal(false)}>
<div style={{background:'white',borderRadius:16,padding:'1.5rem',width:'100%',maxWidth:420}} onClick={e=>e.stopPropagation()}>
<h3 style={{fontSize:17,fontWeight:600,color:'#1a1a1a',marginBottom:'1rem'}}>Nuevo evento</h3>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5}}>Titulo</label>
<input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} placeholder="Ej: Primer parcial..." value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))}/>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5,marginTop:12}}>Fecha</label>
<input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} type="date" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))}/>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5,marginTop:12}}>Tipo</label>
<select style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))}>{TIPOS.map(t=><option key={t.id} value={t.id}>{t.label}</option>)}</select>
<label style={{fontSize:13,color:'#666',display:'block',marginBottom:5,marginTop:12}}>Descripcion (opcional)</label>
<input style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',fontSize:14,boxSizing:'border-box'}} placeholder="Detalles..." value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))}/>
<div style={{display:'flex',gap:8,marginTop:16}}>
<button style={{flex:1,background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'10px',fontSize:14,fontWeight:600,cursor:'pointer'}} onClick={guardar} disabled={guardando||!form.titulo||!form.fecha}>{guardando?'Guardando...':'Guardar'}</button>
<button style={{flex:1,background:'none',border:'1px solid #ddd',borderRadius:8,padding:'10px',fontSize:14,cursor:'pointer',color:'#888'}} onClick={()=>setModal(false)}>Cancelar</button>
</div>
</div>
</div>}
</div>);
}
