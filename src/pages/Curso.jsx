import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { exportarPDFCurso } from '../utils/helpers';
import Dashboard from '../components/Dashboard';
import TomarAsistencia from '../components/TomarAsistencia';
import Temario from '../components/Temario';
import Agenda from '../components/Agenda';

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [registros, setRegistros] = useState({});
  const [tab, setTab] = useState('dashboard');
  const [tomarAsistencia, setTomarAsistencia] = useState(false);

  useEffect(() => { cargarCurso(); }, [id]);

  async function cargarCurso() {
    const snap = await getDoc(doc(db, 'cursos', id));
    if (snap.exists()) setCurso({ id: snap.id, ...snap.data() });
    const q = query(collection(db, 'registros'), where('cursoId', '==', id));
    const rSnap = await getDocs(q);
    const regs = {};
    rSnap.docs.forEach(d => { regs[d.data().fecha] = { id: d.id, ...d.data() }; });
    setRegistros(regs);
  }

  if (!curso) return <div style={{padding:'2rem',textAlign:'center',color:'#888'}}>Cargando...</div>;

  if (tomarAsistencia) return (
    <TomarAsistencia curso={curso} registros={registros} onGuardar={()=>{setTomarAsistencia(false);cargarCurso();}} onVolver={()=>setTomarAsistencia(fals
cat > src/pages/Curso.jsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { exportarPDFCurso } from '../utils/helpers';
import Dashboard from '../components/Dashboard';
import TomarAsistencia from '../components/TomarAsistencia';
import Temario from '../components/Temario';
import Agenda from '../components/Agenda';

export default function Curso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [registros, setRegistros] = useState({});
  const [tab, setTab] = useState('dashboard');
  const [tomarAsistencia, setTomarAsistencia] = useState(false);

  useEffect(() => { cargarCurso(); }, [id]);

  async function cargarCurso() {
    const snap = await getDoc(doc(db, 'cursos', id));
    if (snap.exists()) setCurso({ id: snap.id, ...snap.data() });
    const q = query(collection(db, 'registros'), where('cursoId', '==', id));
    const rSnap = await getDocs(q);
    const regs = {};
    rSnap.docs.forEach(d => { regs[d.data().fecha] = { id: d.id, ...d.data() }; });
    setRegistros(regs);
  }

  if (!curso) return <div style={{padding:'2rem',textAlign:'center',color:'#888'}}>Cargando...</div>;

  if (tomarAsistencia) return (
    <TomarAsistencia curso={curso} registros={registros} onGuardar={()=>{setTomarAsistencia(false);cargarCurso();}} onVolver={()=>setTomarAsistencia(false)} />
  );

  return (
    <div style={{minHeight:'100vh',background:'#f8f8f6',padding:'1rem'}}>
      <div style={{maxWidth:720,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:4}}>
          <button style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888',padding:0}} onClick={()=>navigate(-1)}>←</button>
          <h2 style={{flex:1,fontSize:20,fontWeight:600,color:'#1a1a1a'}}>{curso.nombre}</h2>
          <button style={{background:'#378ADD',color:'white',border:'none',borderRadius:8,padding:'8px 14px',fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>setTomarAsistencia(true)}>Tomar asistencia</button>
        </div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem',paddingBottom:'1rem',borderBottom:'1px solid #eee'}}>
          <span style={{fontSize:13,color:'#888'}}>{curso.horario} · {curso.alumnos?.length||0} alumnos</span>
          <button style={{background:'none',border:'1px solid #ddd',borderRadius:8,padding:'5px 12px',fontSize:12,cursor:'pointer',color:'#888'}} onClick={()=>exportarPDFCurso(curso,curso.alumnos,registros)}>Exportar PDF</button>
        </div>
        <div style={{display:'flex',gap:0,marginBottom:'1.25rem',borderBottom:'1px solid #eee'}}>
          {['dashboard','temario','agenda'].map(t=>(
            <button key={t} style={{padding:'8px 20px',fontSize:14,cursor:'pointer',border:'none',background:'none',color:tab===t?'#378ADD':'#999',borderBottom:tab===t?'2px solid #378ADD':'2px solid transparent',marginBottom:-1,fontFamily:'inherit',fontWeight:tab===t?600:400,textTransform:'capitalize'}} onClick={()=>setTab(t)}>{t}</button>
          ))}
        </div>
        {tab==='dashboard' && <Dashboard curso={curso} registros={registros} />}
        {tab==='temario' && <Temario curso={curso} registros={registros} onActualizar={cargarCurso} />}
        {tab==='agenda' && <Agenda cursoId={id} />}
      </div>
    </div>
  );
}
