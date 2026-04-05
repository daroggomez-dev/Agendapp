import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { calcularStats, exportarPDFCurso, formatearFechaCorta, esFeriado } from '../utils/helpers';
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

  if (!curso) return <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando...</div>;

  if (tomarAsistencia) return (
    <TomarAsistencia
      curso={curso}
      registros={registros}
      onGuardar={() => { setTomarAsistencia(false); cargarCurso(); }}
      onVolver={() => setTomarAsistencia(false)}
    />
  );

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'temario', label: 'Temario' },
    { id: 'agenda', label: 'Agenda' },
  ];

  return (
    <div style={s.container}>
      <div style={s.inner}>
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>←</button>
          <h2 style={s.titulo}>{curso.nombre}</h2>
          <button style={s.btnPrimary} onClick={() => setTomarAsistencia(true)}>Tomar asistencia</button>
        </div>
        <div style={s.subHeader}>
          <span style={s.subTxt}>{curso.horario} · {curso.alumnos?.length || 0} alumnos</span>
          <button style={s.btnPdf} onClick={() => exportarPDFCurso(curso, curso.alumnos, registros)}>
            Exportar PDF
          </button>
        </div>

        <div style={s.tabs}>
          {tabs.map(t => (
            <button
              key={t.id}
              style={{ ...s.tab, ...(tab === t.id ? s.tabActive : {}) }}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {tab === 'dashboard' && <Dashboard curso={curso} registros={registros} />}
        {tab === 'temario' && <Temario curso={curso} registros={registros} onActualizar={cargarCurso} />}
        {tab === 'agenda' && <Agenda cursoId={id} />}
      </div>
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f8f8f6', padding: '1rem' },
  inner: { maxWidth: 720, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 },
  backBtn: { background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', padding: 0 },
  titulo: { flex: 1, fontSize: 20, fontWeight: 600, color: '#1a1a1a' },
  btnPrimary: { background: '#378ADD', color: 'white', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  subHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  subTxt: { fontSize: 13, color: '#888' },
  btnPdf: { background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer', color: '#888' },
  tabs: { display: 'flex', gap: 0, marginBottom: '1.25rem', borderBottom: '1px solid #eee' },
  tab: { padding: '8px 20px', fontSize: 14, cursor: 'pointer', border: 'none', background: 'none', color: '#999', borderBottom: '2px solid transparent', marginBottom: -1, fontFamily: 'inherit' },
  tabActive: { color: '#378ADD', borderBottomColor: '#378ADD', fontWeight: 600 },
};
