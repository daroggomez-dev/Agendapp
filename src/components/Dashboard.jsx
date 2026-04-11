import React,{useMemo}from"react";
import{Doughnut,Bar,Line}from"react-chartjs-2";
import{Chart as ChartJS,ArcElement,Tooltip,CategoryScale,LinearScale,BarElement,PointElement,LineElement,Filler}from"chart.js";
import{calcularStats,formatearFechaCorta}from"../utils/helpers";
ChartJS.register(ArcElement,Tooltip,CategoryScale,LinearScale,BarElement,PointElement,LineElement,Filler);
export default function Dashboard({curso,registros}){
const stats=useMemo(()=>{
let presentes=0,ausentes=0,tardes=0,realizadas=0,noReal=0,incomp=0;
curso.alumnos?.forEach(a=>{const s=calcularStats(a,registros);presentes+=s.presentes;ausentes+=s.ausentes;tardes+=s.tardes;realizadas+=s.realizadas;noReal+=s.noRealizadas;incomp+=s.incompletas;});
const totalClases=Object.values(registros).filter(r=>!r.feriado).length;
const totalAlumnos=curso.alumnos?.length||1;
const pctAsist=totalClases>0?Math.round(((presentes+tardes)/(totalClases*totalAlumnos))*100):0;
const totalTareas=realizadas+noReal+incomp;
const pctTareas=totalTareas>0?Math.round(((realizadas+incomp*0.5)/totalTareas)*100):0;
return{presentes,ausentes,tardes,realizadas,noReal,incomp,pctAsist,pctTareas,totalClases};
},[curso,registros]);
const alumnosStats=useMemo(()=>(curso.alumnos||[]).map(a=>({...a,...calcularStats(a,registros)})).sort((a,b)=>b.ausentes-a.ausentes),[curso,registros]);
const enRiesgo=alumnosStats.filter(a=>a.pctAsistencia<60&&a.totalClases>0);
const atencion=alumnosStats.filter(a=>a.pctAsistencia>=60&&a.pctAsistencia<75&&a.totalClases>0);
const fechasOrdenadas=Object.keys(registros).filter(f=>!registros[f].feriado).sort();
const evolucion=fechasOrdenadas.map(fecha=>{const reg=registros[fecha];let p=0,t=0;curso.alumnos?.forEach(a=>{const as=reg.alumnos?.[a.id]?.asistencia;if(as==="presente")p++;if(as==="tarde")t++;});return Math.round(((p+t)/(curso.alumnos?.length||1))*100);});
return(
<div>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,minmax(0,1fr))",gap:10,marginBottom:"1.25rem"}}>
{[{label:"Asistencia",value:stats.pctAsist+"%",color:stats.pctAsist>=80?"#3B6D11":"#854F0B"},{label:"Tareas",value:stats.pctTareas+"%",color:stats.pctTareas>=70?"#3B6D11":"#854F0B"},{label:"Faltas",value:stats.ausentes,color:"#A32D2D"},{label:"Clases",value:stats.totalClases,color:"#185FA5"}].map(m=>(
<div key={m.label} style={{background:"#f5f5f5",borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
<div style={{fontSize:11,color:"#999",marginBottom:4}}>{m.label}</div>
<div style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</div>
</div>))}
</div>
{(enRiesgo.length>0||atencion.length>0)&&<div style={{marginBottom:"1.25rem"}}>
<div style={{fontSize:11,fontWeight:600,color:"#999",textTransform:"uppercase",marginBottom:10}}>Alertas</div>
{enRiesgo.map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:8,background:"#FCEBEB"}}><span style={{fontSize:20}}>{"⚠️"}</span><div><div style={{fontSize:13,fontWeight:600,color:"#A32D2D"}}>{a.nombre}</div><div style={{fontSize:12,color:"#A32D2D"}}>{a.ausentes} faltas - {a.pctAsistencia}% - En riesgo</div></div></div>)}
{atencion.map(a=><div key={a.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:8,background:"#FAEEDA"}}><span style={{fontSize:20}}>{"⚠️"}</span><div><div style={{fontSize:13,fontWeight:600,color:"#854F0B"}}>{a.nombre}</div><div style={{fontSize:12,color:"#854F0B"}}>{a.ausentes} faltas - {a.pctAsistencia}% - Atencion</div></div></div>)}
</div>}
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
<div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"1rem"}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Asistencia</div>
<div style={{position:"relative",height:150}}><Doughnut data={{datasets:[{data:[stats.presentes,stats.ausentes,stats.tardes],backgroundColor:["#639922","#E24B4A","#EF9F27"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:"65%"}}/></div>
</div>
<div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"1rem"}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Tareas</div>
<div style={{position:"relative",height:150}}><Doughnut data={{datasets:[{data:[stats.realizadas,stats.noReal,stats.incomp],backgroundColor:["#1D9E75","#E24B4A","#EF9F27"],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:"65%"}}/></div>
</div>
</div>
{fechasOrdenadas.length>1&&<div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"1rem",marginBottom:12}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Evolucion de asistencia</div>
<div style={{position:"relative",height:180}}><Line data={{labels:fechasOrdenadas.map(f=>formatearFechaCorta(f)),datasets:[{data:evolucion,borderColor:"#639922",backgroundColor:"rgba(99,153,34,0.08)",borderWidth:2,fill:true,tension:0.3}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{min:0,max:100,ticks:{callback:v=>v+"%"}},x:{ticks:{font:{size:11}}}}}}/></div>
</div>}
{alumnosStats.length>0&&<div style={{background:"white",border:"1px solid #eee",borderRadius:12,padding:"1rem",marginBottom:12}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Asistencia por alumno</div>
<div style={{position:"relative",height:Math.max(200,alumnosStats.length*36)}}><Bar data={{labels:alumnosStats.map(a=>a.nombre.split(",")[0]),datasets:[{data:alumnosStats.map(a=>a.pctAsistencia),backgroundColor:alumnosStats.map(a=>a.pctAsistencia>=85?"#639922":a.pctAsistencia>=70?"#EF9F27":"#E24B4A"),borderRadius:4,borderWidth:0}]}} options={{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{min:0,max:100,ticks:{callback:v=>v+"%"}}}}}/></div>
</div>}
<div style={{background:"white",border:"1px solid #eee",borderRadius:12,overflow:"hidden"}}>
<table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
<thead><tr style={{background:"#f8f8f8"}}>{["#","Alumno","Faltas","Asistencia","Tareas"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontWeight:600,color:"#888",fontSize:11,textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
<tbody>{alumnosStats.map((a,i)=><tr key={a.id} style={{borderTop:"1px solid #f0f0f0"}}>
<td style={{padding:"10px 12px",color:"#bbb",fontWeight:600}}>{i+1}</td>
<td style={{padding:"10px 12px",fontWeight:500}}>{a.nombre}</td>
<td style={{padding:"10px 12px",color:a.ausentes>=3?"#A32D2D":"#1a1a1a",fontWeight:600}}>{a.ausentes}</td>
<td style={{padding:"10px 12px"}}><span style={{fontSize:12,fontWeight:600,padding:"3px 9px",borderRadius:8,background:a.pctAsistencia>=85?"#EAF3DE":a.pctAsistencia>=70?"#FAEEDA":"#FCEBEB",color:a.pctAsistencia>=85?"#3B6D11":a.pctAsistencia>=70?"#854F0B":"#A32D2D"}}>{a.pctAsistencia}%</span></td>
<td style={{padding:"10px 12px"}}><span style={{fontSize:12,fontWeight:600,padding:"3px 9px",borderRadius:8,background:a.pctTareas>=80?"#EAF3DE":a.pctTareas>=60?"#FAEEDA":"#FCEBEB",color:a.pctTareas>=80?"#3B6D11":a.pctTareas>=60?"#854F0B":"#A32D2D"}}>{a.pctTareas}%</span></td>
</tr>)}</tbody>
</table>
</div>
</div>);
}
