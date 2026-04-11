import React,{useState}from"react";
import{doc,setDoc}from"firebase/firestore";
import{db}from"../firebase/config";
import{FERIADOS_ARGENTINA_2026}from"../utils/helpers";
export default function TomarAsistencia({curso,registros,onGuardar,onVolver}){
const hoy=new Date().toISOString().split("T")[0];
const regHoy=registros[hoy]||{};
const[flujo,setFlujo]=useState(null);
const[asistencias,setAsistencias]=useState(()=>{const init={};curso.alumnos?.forEach(a=>{init[a.id]=regHoy.alumnos?.[a.id]?.asistencia||"presente";});return init;});
const[tareas,setTareas]=useState(()=>{const init={};curso.alumnos?.forEach(a=>{init[a.id]=regHoy.alumnos?.[a.id]?.tarea||"";});return init;});
const[nombreFeriado,setNombreFeriado]=useState("");
const[listaGuardada,setListaGuardada]=useState(!!regHoy.listaGuardada);
const[tareasGuardadas,setTareasGuardadas]=useState(!!regHoy.tareasGuardadas);
const[guardando,setGuardando]=useState(false);
const feriadoSugerido=FERIADOS_ARGENTINA_2026.find(f=>f.fecha===hoy);
const fechaFormateada=new Date(hoy+"T12:00:00").toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});
function marcarTodos(tipo){const nuevo={};curso.alumnos?.forEach(a=>{nuevo[a.id]=tipo;});setAsistencias(nuevo);}
async function guardarLista(){setGuardando(true);const alumnosData={};curso.alumnos?.forEach(a=>{alumnosData[a.id]={...regHoy.alumnos?.[a.id],asistencia:asistencias[a.id]};});await setDoc(doc(db,"registros",curso.id+"_"+hoy),{cursoId:curso.id,fecha:hoy,alumnos:alumnosData,listaGuardada:true,tareasGuardadas},{merge:true});setListaGuardada(true);setGuardando(false);setFlujo(null);}
async function guardarTareas(){setGuardando(true);const alumnosData={};curso.alumnos?.forEach(a=>{alumnosData[a.id]={...regHoy.alumnos?.[a.id],tarea:tareas[a.id]};});await setDoc(doc(db,"registros",curso.id+"_"+hoy),{cursoId:curso.id,fecha:hoy,alumnos:alumnosData,listaGuardada,tareasGuardadas:true},{merge:true});setTareasGuardadas(true);setGuardando(false);setFlujo(null);}
async function guardarFeriado(){setGuardando(true);const alumnosData={};curso.alumnos?.forEach(a=>{alumnosData[a.id]={asistencia:"feriado",tarea:""};});await setDoc(doc(db,"registros",curso.id+"_"+hoy),{cursoId:curso.id,fecha:hoy,alumnos:alumnosData,feriado:true,nombreFeriado:nombreFeriado||feriadoSugerido?.nombre||"Sin especificar",listaGuardada:true,tareasGuardadas:true},{merge:true});setGuardando(false);onGuardar();}

const colores={presente:{bg:"#EAF3DE",color:"#3B6D11",selBg:"#639922"},ausente:{bg:"#FCEBEB",color:"#A32D2D",selBg:"#E24B4A"},tarde:{bg:"#FAEEDA",color:"#854F0B",selBg:"#EF9F27"}};
if(flujo==="feriado")return(
<div style={{minHeight:"100vh",background:"#f8f8f6",padding:"1rem"}}>
<div style={{maxWidth:680,margin:"0 auto"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:"1.25rem"}}>
<button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}} onClick={()=>setFlujo(null)}>{"<-"}</button>
<h2 style={{fontSize:18,fontWeight:600}}>Feriado</h2>
</div>
<div style={{textAlign:"center",padding:"1.5rem 0"}}>
<div style={{fontSize:48,marginBottom:12}}>{"📅"}</div>
<div style={{fontSize:16,fontWeight:600,marginBottom:6}}>Marcar clase como feriado</div>
<div style={{fontSize:13,color:"#888",marginBottom:"1.5rem"}}>Se registrara para los {curso.alumnos?.length} alumnos</div>
<div style={{textAlign:"left"}}>
<label style={{fontSize:13,color:"#666",display:"block",marginBottom:5}}>Que feriado es? (opcional)</label>
<input style={{width:"100%",border:"1px solid #ddd",borderRadius:8,padding:"10px 12px",fontSize:14,boxSizing:"border-box"}} placeholder={feriadoSugerido?feriadoSugerido.nombre:"Ej: Dia de la Memoria..."} value={nombreFeriado} onChange={e=>setNombreFeriado(e.target.value)}/>
<div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:10}}>
{["Dia de la Memoria","Dia del Trabajador","25 de Mayo","9 de Julio","17 de Agosto","12 de Octubre"].map(f=>(
<button key={f} style={{border:"1px solid #ddd",borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer",background:"white",color:"#666"}} onClick={()=>setNombreFeriado(f)}>{f}</button>))}
</div>
</div>
<button style={{width:"100%",background:"#378ADD",color:"white",border:"none",borderRadius:8,padding:"12px",fontSize:15,fontWeight:600,cursor:"pointer",marginTop:"1.5rem"}} onClick={guardarFeriado} disabled={guardando}>{guardando?"Guardando...":"Confirmar feriado"}</button>
<button style={{width:"100%",background:"none",border:"1px solid #ddd",borderRadius:8,padding:"11px",fontSize:14,cursor:"pointer",color:"#888",marginTop:8}} onClick={()=>setFlujo(null)}>Cancelar</button>
</div>
</div>
</div>);

if(flujo==="lista")return(
<div style={{minHeight:"100vh",background:"#f8f8f6",padding:"1rem"}}>
<div style={{maxWidth:680,margin:"0 auto"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
<button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}} onClick={()=>setFlujo(null)}>{"<-"}</button>
<h2 style={{fontSize:18,fontWeight:600}}>Tomar lista</h2>
</div>
<div style={{fontSize:13,color:"#888",marginBottom:"1rem"}}>{fechaFormateada}</div>
<div style={{marginBottom:"1rem"}}>
<div style={{fontSize:11,color:"#999",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,fontWeight:600}}>Marcar todos como</div>
<div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
<button style={{border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",background:"#EAF3DE",color:"#3B6D11"}} onClick={()=>marcarTodos("presente")}>Todos presentes</button>
<button style={{border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",background:"#FCEBEB",color:"#A32D2D"}} onClick={()=>marcarTodos("ausente")}>Todos ausentes</button>
<button style={{border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",background:"#FAEEDA",color:"#854F0B"}} onClick={()=>marcarTodos("tarde")}>Todos tarde</button>
<button style={{border:"none",borderRadius:8,padding:"8px 14px",fontSize:13,fontWeight:600,cursor:"pointer",background:"#E6F1FB",color:"#185FA5"}} onClick={()=>setFlujo("feriado")}>Feriado</button>
</div>
</div>
{curso.alumnos?.map(alumno=>{const sel=asistencias[alumno.id];return(
<div key={alumno.id} style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
<div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{alumno.nombre}</div>
<div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
{["presente","ausente","tarde"].map(tipo=>{const c=colores[tipo];const isSel=sel===tipo;return(
<button key={tipo} style={{border:"none",borderRadius:8,padding:"7px 13px",fontSize:13,fontWeight:500,cursor:"pointer",background:isSel?c.selBg:c.bg,color:isSel?"white":c.color}} onClick={()=>setAsistencias(prev=>({...prev,[alumno.id]:tipo}))}>{tipo.charAt(0).toUpperCase()+tipo.slice(1)}</button>);})}
</div>
</div>);})}
<button style={{width:"100%",background:"#378ADD",color:"white",border:"none",borderRadius:8,padding:"12px",fontSize:15,fontWeight:600,cursor:"pointer",marginTop:"1rem"}} onClick={guardarLista} disabled={guardando}>{guardando?"Guardando...":"Guardar lista"}</button>
</div>
</div>);

if(flujo==="tareas")return(
<div style={{minHeight:"100vh",background:"#f8f8f6",padding:"1rem"}}>
<div style={{maxWidth:680,margin:"0 auto"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
<button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}} onClick={()=>setFlujo(null)}>{"<-"}</button>
<h2 style={{fontSize:18,fontWeight:600}}>Registrar tareas</h2>
</div>
<div style={{fontSize:13,color:"#888",marginBottom:"1rem"}}>{fechaFormateada}</div>
{curso.alumnos?.map(alumno=>{const sel=tareas[alumno.id];return(
<div key={alumno.id} style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"12px 14px",marginBottom:10}}>
<div style={{fontSize:14,fontWeight:600,marginBottom:10}}>{alumno.nombre}</div>
<div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
{[{id:"realizada",label:"Realizada",bg:"#E1F5EE",color:"#085041",selBg:"#1D9E75"},{id:"incompleta",label:"Incompleta",bg:"#FAEEDA",color:"#854F0B",selBg:"#EF9F27"},{id:"no_realizada",label:"No realizada",bg:"#FCEBEB",color:"#A32D2D",selBg:"#E24B4A"}].map(({id,label,bg,color,selBg})=>{const isSel=sel===id;return(
<button key={id} style={{border:"none",borderRadius:8,padding:"7px 13px",fontSize:13,fontWeight:500,cursor:"pointer",background:isSel?selBg:bg,color:isSel?"white":color}} onClick={()=>setTareas(prev=>({...prev,[alumno.id]:id}))}>{label}</button>);})}
</div>
</div>);})}
<button style={{width:"100%",background:"#378ADD",color:"white",border:"none",borderRadius:8,padding:"12px",fontSize:15,fontWeight:600,cursor:"pointer",marginTop:"1rem"}} onClick={guardarTareas} disabled={guardando}>{guardando?"Guardando...":"Guardar tareas"}</button>
</div>
</div>);
return(
<div style={{minHeight:"100vh",background:"#f8f8f6",padding:"1rem"}}>
<div style={{maxWidth:680,margin:"0 auto"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
<button style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#888"}} onClick={onVolver}>{"<-"}</button>
<h2 style={{fontSize:18,fontWeight:600}}>{curso.nombre}</h2>
</div>
<div style={{fontSize:13,color:"#888",marginBottom:"1.25rem"}}>{fechaFormateada}</div>
<div style={{fontSize:11,color:"#999",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12,fontWeight:600}}>Que queres registrar ahora?</div>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
<div style={{background:"white",border:listaGuardada?"1px solid #b5dba5":"1px solid #eee",borderRadius:16,padding:"1.25rem 1rem",cursor:"pointer",textAlign:"center"}} onClick={()=>setFlujo("lista")}>
<div style={{width:56,height:56,borderRadius:12,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",background:listaGuardada?"#EAF3DE":"#f5f5f5",fontSize:24}}>{listaGuardada?"✓":"👥"}</div>
<div style={{fontSize:15,fontWeight:600,color:"#1a1a1a",marginBottom:4}}>{listaGuardada?"Lista tomada":"Tomar lista"}</div>
<div style={{fontSize:12,color:"#aaa"}}>Presente - Ausente - Tarde</div>
</div>
<div style={{background:"white",border:tareasGuardadas?"1px solid #b5dba5":"1px solid #eee",borderRadius:16,padding:"1.25rem 1rem",cursor:"pointer",textAlign:"center"}} onClick={()=>setFlujo("tareas")}>
<div style={{width:56,height:56,borderRadius:12,margin:"0 auto 12px",display:"flex",alignItems:"center",justifyContent:"center",background:tareasGuardadas?"#E1F5EE":"#f5f5f5",fontSize:24}}>{tareasGuardadas?"✓":"📝"}</div>
<div style={{fontSize:15,fontWeight:600,color:"#1a1a1a",marginBottom:4}}>{tareasGuardadas?"Tareas registradas":"Registrar tareas"}</div>
<div style={{fontSize:12,color:"#aaa"}}>Realizada - Incompleta - No realizada</div>
</div>
</div>
{(listaGuardada||tareasGuardadas)&&<button style={{width:"100%",background:"#378ADD",color:"white",border:"none",borderRadius:8,padding:"12px",fontSize:15,fontWeight:600,cursor:"pointer",marginTop:"1rem"}} onClick={onGuardar}>Listo, volver al curso</button>}
</div>
</div>);
}
