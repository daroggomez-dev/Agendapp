import React,{useMemo}from 'react';
import{Doughnut,Bar,Line}from 'react-chartjs-2';
import{Chart as ChartJS,ArcElement,Tooltip,CategoryScale,LinearScale,BarElement,PointElement,LineElement,Filler}from 'chart.js';
import{calcularStats,formatearFechaCorta}from '../utils/helpers';
ChartJS.register(ArcElement,Tooltip,CategoryScale,LinearScale,BarElement,PointElement,LineElement,Filler);
export default function Dashboard({curso,registros}){
const stats=useMemo(()=>{
let presentes=0,ausentes=0,tardes=0,realizadas=0,noReal=0,incomp=0;
curso.alumnos?.forEach(a=>{
const s=calcularStats(a,registros);
presentes+=s.presentes;ausentes+=s.ausentes;tardes+=s.tardes;
realizadas+=s.realizadas;noReal+=s.noRealizadas;incomp+=s.incompletas;
});
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
const evolucion=fechasOrdenadas.map(fecha=>{
const reg=registros[fecha];
let p=0,t=0;
curso.alumnos?.forEach(a=>{
const as=reg.alumnos?.[a.id]?.asistencia;
if(as==='presente')p++;if(as==='tarde')t++;
});
return Math.round(((p+t)/(curso.alumnos?.length||1))*100);
});
return(
<div>
<div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:10,marginBottom:'1.25rem'}}>
{[{label:'Asistencia',value:`${stats.pctAsist}%`,color:stats.pctAsist>=80?'#3B6D11':'#854F0B'},
{label:'Tareas',value:`${stats.pctTareas}%`,color:stats.pctTareas>=70?'#3B6D11':'#854F0B'},
{label:'Faltas',value:stats.ausentes,color:'#A32D2D'},
{label:'Clases',value:stats.totalClases,color:'#185FA5'}].map(m=>(
<div key={m.label} style={{background:'#f5f5f5',borderRadius:10,padding:'12px 10px',textAlign:'center'}}>
<div style={{fontSize:11,color:'#999',marginBottom:4}}>{m.label}</div>
<div style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</div>
</div>))}
</div>
{(enRiesgo.length>0||atencion.length>0)&&<div style={{marginBottom:'1.25rem'}}>
<div style={{fontSize:11,fontWeight:600,color:'#999',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:10}}>Alertas</div>
{enRiesgo.map(a=><div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,marginBottom:8,background:'#FCEBEB'}}><span style={{fontSize:20}}>⚠️</span><div><div style={{fontSize:13,fontWeight:600,color:'#A32D2D'}}>{a.nombre}</div><div style={{fontSize:12,color:'#A32D2D'}}>{a.ausentes} faltas · {a.pctAsistencia}% · En riesgo</div></div></div>)}
{atencion.map(a=><div key={a.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:10,marginBottom:8,background:'#FAEEDA'}}><span style={{fontSize:20}}>⚠️</span><div><div style={{fontSize:13,fontWeight:600,color:'#854F0B'}}>{a.nombre}</div><div style={{fontSize:12,color:'#854F0B'}}>{a.ausentes} faltas · {a.pctAsistencia}% · Atención</div></div></div>)}
</div>}
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
<div style={{background:'white',border:'1px solid #eee',borderRadius:12,padding:'1rem'}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Asistencia</div>
<div style={{position:'relative',height:150}}><Doughnut data={{datasets:[{data:[stats.presentes,stats.ausentes,stats.tardes],backgroundColor:['#639922','#E24B4A','#EF9F27'],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%'}}/></div>
<div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:10}}>
{[['#639922','Presente'],['#E24B4A','Ausente'],['#EF9F27','Tarde']].map(([c,l])=><span key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#888'}}><span style={{width:10,height:10,borderRadius:2,background:c,display:'inline-block'}}></span>{l}</span>)}
</div>
</div>
<div style={{background:'white',border:'1px solid #eee',borderRadius:12,padding:'1rem'}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Tareas</div>
<div style={{position:'relative',height:150}}><Doughnut data={{datasets:[{data:[stats.realizadas,stats.noReal,stats.incomp],backgroundColor:['#1D9E75','#E24B4A','#EF9F27'],borderWidth:0}]}} options={{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%'}}/></div>
<div style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:10}}>
{[['#1D9E75','Realizada'],['#E24B4A','No realizada'],['#EF9F27','Incompleta']].map(([c,l])=><span key={l} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'#888'}}><span style={{width:10,height:10,borderRadius:2,background:c,display:'inline-block'}}></span>{l}</span>)}
</div>
</div>
</div>
{fechasOrdenadas.length>1&&<div style={{background:'white',border:'1px solid #eee',borderRadius:12,padding:'1rem',marginBottom:12}}>
<div style={{fontSize:13,fontWeight:600,marginBottom:12}}>Evolución de asistencia</div>
<div style={{position:'relative',height:180}}><Line data={{labels:fechasOrdenadas.map(f=>formatearFechaCorta(f)),datasets:[{data:evolucion,borderColor:'#639922',backgroundColor:'rgba(99,153,34,0.08)',borderWidth:2,