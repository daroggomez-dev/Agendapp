
export function generarFechasClase(diasSemana,fechaInicio,fechaFin){
const fechas=[];
const inicio=new Date(fechaInicio);
const fin=new Date(fechaFin);
const current=new Date(inicio);
while(current<=fin){
if(diasSemana.includes(current.getDay())){
fechas.push(new Date(current).toISOString().split('T')[0]);
}
current.setDate(current.getDate()+1);
}
return fechas;
}

export const FERIADOS_ARGENTINA_2026=[
{fecha:'2026-01-01',nombre:'Anio Nuevo'},
{fecha:'2026-02-16',nombre:'Carnaval'},
{fecha:'2026-02-17',nombre:'Carnaval'},
{fecha:'2026-03-24',nombre:'Dia de la Memoria'},
{fecha:'2026-04-02',nombre:'Dia del Veterano'},
{fecha:'2026-04-03',nombre:'Viernes Santo'},
{fecha:'2026-05-01',nombre:'Dia del Trabajador'},
{fecha:'2026-05-25',nombre:'25 de Mayo'},
{fecha:'2026-06-15',nombre:'Paso a la Inmortalidad de Guemes'},
{fecha:'2026-06-20',nombre:'Paso a la Inmortalidad de Belgrano'},
{fecha:'2026-07-09',nombre:'9 de Julio'},
{fecha:'2026-08-17',nombre:'Paso a la Inmortalidad de San Martin'},
{fecha:'2026-10-12',nombre:'Dia del Respeto a la Diversidad Cultural'},
{fecha:'2026-11-23',nombre:'Dia de la Soberania Nacional'},
{fecha:'2026-12-08',nombre:'Inmaculada Concepcion'},
{fecha:'2026-12-25',nombre:'Navidad'},
];

export function esFeriado(fecha){
return FERIADOS_ARGENTINA_2026.find(f=>f.fecha===fecha)||null;
}

export function formatearFecha(fechaStr){
const fecha=new Date(fechaStr+'T12:00:00');
return fecha.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'});
}

export function formatearFechaCorta(fechaStr){
const fecha=new Date(fechaStr+'T12:00:00');
return fecha.toLocaleDateString('es-AR',{day:'numeric',month:'short'});
}

export function calcularStats(alumno,registros){
let presentes=0,ausentes=0,tardes=0,feriados=0;
let realizadas=0,incompletas=0,noRealizadas=0;
Object.values(registros||{}).forEach(reg=>{
const a=reg.alumnos?.[alumno.id];
if(!a)return;
if(a.asistencia==='presente')presentes++;
else if(a.asistencia==='ausente')ausentes++;
else if(a.asistencia==='tarde')tardes++;
else if(a.asistencia==='feriado')feriados++;
if(a.tarea==='realizada')realizadas++;
else if(a.tarea==='incompleta')incompletas++;
else if(a.tarea==='no_realizada')noRealizadas++;
});
const totalClases=presentes+ausentes+tardes;
const pctAsistencia=totalClases>0?Math.round(((presentes+tardes)/totalClases)*100):0;
const totalTareas=realizadas+incompletas+noRealizadas;
const pctTareas=totalTareas>0?Math.round(((realizadas+incompletas*0.5)/totalTareas)*100):0;
return{presentes,ausentes,tardes,feriados,realizadas,incompletas,noRealizadas,totalClases,pctAsistencia,totalTareas,pctTareas};
}

export async function exportarPDFCurso(curso,alumnos,registros){
const{jsPDF}=await import('jspdf');
await import('jspdf-autotable');
const doc=new jsPDF();
const fecha=new Date().toLocaleDateString('es-AR');
doc.setFontSize(18);
doc.text(curso.nombre,14,20);
doc.setFontSize(11);
doc.setTextColor(100);
doc.text('Generado el '+fecha,14,28);
const filas=(alumnos||[]).map((alumno,i)=>{
const s=calcularStats(alumno,registros);
return[i+1,alumno.nombre,s.presentes,s.ausentes,s.tardes,s.pctAsistencia+'%',s.realizadas,s.noRealizadas,s.pctTareas+'%'];
});
doc.autoTable({startY:35,head:[['#','Alumno','Pres.','Aus.','Tarde','% Asist.','Tar.Real.','Tar.No R.','% Tareas']],body:filas,styles:{fontSize:9},headStyles:{fillColor:[55,138,221]}});
doc.save(curso.nombre+'-asistencias.pdf');
}
