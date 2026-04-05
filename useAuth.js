import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

export default function Inicio() {
  const { currentUser, userData, logout } = useAuth();
  const [instituciones, setInstituciones] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombreInst, setNombreInst] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoBase64, setLogoBase64] = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const nombre = userData?.nombre || currentUser?.displayName || 'Profe';
  const saludo = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  useEffect(() => {
    cargarInstituciones();
  }, []);

  async function cargarInstituciones() {
    setCargando(true);
    const q = query(collection(db, 'instituciones'), where('uid', '==', currentUser.uid));
    const snap = await getDocs(q);
    setInstituciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setCargando(false);
  }

  function handleLogo(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result);
      setLogoBase64(ev.target.result);
    };
    reader.readAsDataURL(file);
  }

  async function guardarInstitucion() {
    if (!nombreInst.trim()) return;
    await addDoc(collection(db, 'instituciones'), {
      uid: currentUser.uid,
      nombre: nombreInst.trim(),
      logo: logoBase64 || null,
      creadoEn: new Date()
    });
    setNombreInst('');
    setLogoPreview(null);
    setLogoBase64(null);
    setModalAbierto(false);
    cargarInstituciones();
  }

  const iniciales = (nombre) => nombre.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={s.container}>
      <div style={s.inner}>

        {/* Perfil */}
        <div style={s.perfil}>
          <div style={s.avatar}>{iniciales(nombre)}</div>
          <div style={{ flex: 1 }}>
            <div style={s.perfilNombre}>{saludo()}, {nombre.split(' ')[0]}</div>
            <div style={s.perfilSub}>{instituciones.length} institución{instituciones.length !== 1 ? 'es' : ''}</div>
          </div>
          <button style={s.btnLogout} onClick={logout}>Salir</button>
        </div>

        {/* Instituciones */}
        <div style={s.sectionLabel}>Mis instituciones</div>

        {cargando ? (
          <div style={s.empty}>Cargando...</div>
        ) : (
          <div style={s.grid}>
            {instituciones.map(inst => (
              <div
                key={inst.id}
                style={s.instCard}
                onClick={() => navigate(`/institucion/${inst.id}`)}
              >
                <div style={s.logoBox}>
                  {inst.logo
                    ? <img src={inst.logo} alt={inst.nombre} style={s.logoImg} />
                    : <div style={s.logoPlaceholder}>{iniciales(inst.nombre)}</div>
                  }
                </div>
                <div style={s.instNombre}>{inst.nombre}</div>
              </div>
            ))}

            {/* Agregar */}
            <div style={s.agregarCard} onClick={() => setModalAbierto(true)}>
              <div style={s.agregarIcon}>+</div>
              <div style={s.agregarTxt}>Agregar institución</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal nueva institución */}
      {modalAbierto && (
        <div style={s.overlay} onClick={() => setModalAbierto(false)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <h3 style={s.modalTitulo}>Nueva institución</h3>

            <label style={s.fieldLabel}>Nombre</label>
            <input
              style={s.input}
              placeholder="Ej: Colegio San Martín..."
              value={nombreInst}
              onChange={e => setNombreInst(e.target.value)}
            />

            <label style={s.fieldLabel}>
              Logo <span style={{ fontSize: 11, color: '#999' }}>opcional</span>
            </label>
            <div
              style={s.uploadArea}
              onClick={() => document.getElementById('file-logo').click()}
            >
              {logoPreview
                ? <img src={logoPreview} alt="preview" style={{ height: 60, objectFit: 'contain' }} />
                : <span>Tocá para subir imagen (PNG, JPG)</span>
              }
              <input id="file-logo" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
            </div>

            <div style={s.modalBtns}>
              <button style={s.btnPrimary} onClick={guardarInstitucion}>Guardar</button>
              <button style={s.btnSec} onClick={() => setModalAbierto(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  container: { minHeight: '100vh', background: '#f8f8f6', padding: '1rem' },
  inner: { maxWidth: 680, margin: '0 auto' },
  perfil: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' },
  avatar: { width: 48, height: 48, borderRadius: '50%', background: '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#185FA5', flexShrink: 0 },
  perfilNombre: { fontSize: 17, fontWeight: 600, color: '#1a1a1a' },
  perfilSub: { fontSize: 13, color: '#888', marginTop: 2 },
  btnLogout: { background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '6px 12px', fontSize: 13, cursor: 'pointer', color: '#888' },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 },
  instCard: { background: 'white', border: '1px solid #eee', borderRadius: 16, padding: '1.25rem 1rem', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s' },
  logoBox: { width: 72, height: 72, borderRadius: 12, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f5f5f5' },
  logoImg: { width: '100%', height: '100%', objectFit: 'contain' },
  logoPlaceholder: { fontSize: 22, fontWeight: 600, color: '#888' },
  instNombre: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.3 },
  agregarCard: { background: 'none', border: '1.5px dashed #ddd', borderRadius: 16, padding: '1.25rem 1rem', cursor: 'pointer', textAlign: 'center' },
  agregarIcon: { width: 72, height: 72, borderRadius: 12, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', fontSize: 32, color: '#aaa' },
  agregarTxt: { fontSize: 14, color: '#aaa' },
  empty: { textAlign: 'center', padding: '3rem', color: '#aaa' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' },
  modal: { background: 'white', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 420 },
  modalTitulo: { fontSize: 17, fontWeight: 600, color: '#1a1a1a', marginBottom: '1rem' },
  fieldLabel: { fontSize: 13, color: '#666', display: 'block', marginBottom: 5, marginTop: 12 },
  input: { width: '100%', border: '1px solid #ddd', borderRadius: 8, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box' },
  uploadArea: { border: '1.5px dashed #ddd', borderRadius: 8, padding: '1.5rem', textAlign: 'center', cursor: 'pointer', color: '#aaa', fontSize: 13, marginTop: 5, minHeight: 80, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modalBtns: { display: 'flex', gap: 8, marginTop: 16 },
  btnPrimary: { flex: 1, background: '#378ADD', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSec: { flex: 1, background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '10px', fontSize: 14, cursor: 'pointer', color: '#888' },
};
