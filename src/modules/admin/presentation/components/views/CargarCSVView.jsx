import React, { useState, useRef } from 'react';
import { AdminRepositoryImpl } from '../../../infrastructure/repositories/AdminRepositoryImpl';

const repo = new AdminRepositoryImpl();

// â”€â”€â”€ Stepper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const NOMBRES_PASO = ['Semestre', 'Usuarios', 'Estudiantes', 'Empleados', 'Contratistas', 'Confirmar'];

const Stepper = ({ pasoActual }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4">
    <div className="flex items-center">
      {NOMBRES_PASO.map((nombre, i) => {
        const done   = i < pasoActual;
        const active = i === pasoActual;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done   ? 'bg-ucc-green text-white' :
                active ? 'bg-ucc-green text-white' :
                         'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <p className={`text-xs mt-1 font-medium whitespace-nowrap ${
                active ? 'text-ucc-green' : done ? 'text-ucc-green' : 'text-gray-400'
              }`}>
                {nombre}
              </p>
            </div>
            {i < NOMBRES_PASO.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${i < pasoActual ? 'bg-ucc-green' : 'bg-gray-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

// â”€â”€â”€ Tabla de formato esperado â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TablaFormato = ({ columnas }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
    <p className="font-semibold text-gray-700 text-sm mb-3">Formato esperado del CSV</p>
    <div className="overflow-x-auto rounded-lg border border-gray-100">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-2.5 text-left font-medium">Columna (encabezado exacto)</th>
            <th className="px-4 py-2.5 text-left font-medium">Requerido</th>
            <th className="px-4 py-2.5 text-left font-medium">Ejemplo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {columnas.map(col => (
            <tr key={col.key}>
              <td className="px-4 py-2.5">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{col.key}</code>
              </td>
              <td className="px-4 py-2.5">
                {col.req
                  ? <span className="text-red-500 font-medium">Si</span>
                  : <span className="text-gray-400">Opcional</span>}
              </td>
              <td className="px-4 py-2.5 text-gray-500 italic">{col.ejemplo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-400 mt-2.5">
      La primera fila del archivo debe contener los encabezados exactamente como aparecen arriba.
    </p>
  </div>
);

// â”€â”€â”€ Tabla de vista previa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TablaPreview = ({ filas, previewCols, archivo }) => (
  <div className="space-y-3">
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
      <p className="font-semibold text-gray-800">{archivo?.name}</p>
      <p className="text-xs text-gray-400 mt-0.5">
        <span className="font-medium text-gray-600">{filas.length} registros</span> detectados
      </p>
    </div>
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left font-medium">#</th>
              {previewCols.map(k => (
                <th key={k} className="px-4 py-3 text-left font-medium">{k.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filas.slice(0, 15).map((fila, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                {previewCols.map(k => (
                  <td key={k} className="px-4 py-2.5 text-gray-700">
                    {fila[k] || <span className="text-gray-300">-</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filas.length > 15 && (
        <p className="text-xs text-gray-400 text-center py-3 border-t border-gray-50">
          ... y {filas.length - 15} registros mas
        </p>
      )}
    </div>
  </div>
);

/** Parsea CSV a array de objetos */
function parsearCSV(texto) {
  // Eliminar BOM (Excel UTF-8 lo agrega al inicio) y espacios sobrantes
  const textoLimpio = texto.replace(/^\uFEFF/, '').trim();
  const lineas = textoLimpio.split('\n');
  // Soportar separador ; (Excel en espaÃ±ol) o , (estÃ¡ndar)
  const separador = lineas[0].includes(';') ? ';' : ',';
  const encabezados = lineas[0].split(separador).map(h => h.trim().replace(/\r/g, '').replace(/"/g, ''));
  return lineas
    .slice(1)
    .map(linea => {
      const valores = linea.split(separador).map(v => v.trim().replace(/\r/g, '').replace(/"/g, ''));
      const fila = {};
      encabezados.forEach((h, i) => { fila[h] = valores[i] ?? ''; });
      return fila;
    })
    .filter(f => f.id_institucional);
}

// â”€â”€â”€ Config de cada paso CSV â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PASOS_CSV = [
  {
    key:         'usuarios',
    label:       'Usuarios base',
    descripcion: 'Carga los datos personales base. Debe hacerse primero — los demas CSV dependen de este.',
    obligatorio: true,
    color: { btn: 'bg-gray-700 hover:bg-gray-800', badge: 'bg-gray-100 text-gray-700' },
    columnas: [
      { key: 'id_institucional',    label: 'ID Institucional', req: true,  ejemplo: '80123456'         },
      { key: 'documento_identidad', label: 'Documento',        req: true,  ejemplo: '1001234567'       },
      { key: 'nombre_completo',     label: 'Nombre completo',  req: true,  ejemplo: 'Juan Perez Gomez' },
    ],
    preview: ['id_institucional', 'documento_identidad', 'nombre_completo'],
    handler: (filas) => repo.cargarUsuarios(filas),
  },
  {
    key:         'estudiantes',
    label:       'Estudiantes',
    descripcion: 'Asigna el rol Estudiante y registra el programa academico de cada persona.',
    obligatorio: false,
    color: { btn: 'bg-blue-600 hover:bg-blue-700', badge: 'bg-blue-50 text-blue-700' },
    columnas: [
      { key: 'id_institucional',   label: 'ID Institucional',   req: true, ejemplo: '80123456'               },
      { key: 'programa_academico', label: 'Programa academico', req: true, ejemplo: 'Ingenieria de Sistemas' },
    ],
    preview: ['id_institucional', 'programa_academico'],
    handler: (filas) => repo.cargarEstudiantes(filas),
  },
  {
    key:         'empleados',
    label:       'Empleados',
    descripcion: 'Asigna el rol Empleado y registra cargo y dependencia.',
    obligatorio: false,
    color: { btn: 'bg-purple-600 hover:bg-purple-700', badge: 'bg-purple-50 text-purple-700' },
    columnas: [
      { key: 'id_institucional', label: 'ID Institucional', req: true,  ejemplo: '80567890'            },
      { key: 'cargo',            label: 'Cargo',            req: true,  ejemplo: 'Coordinador de Caja' },
      { key: 'dependencia',      label: 'Dependencia',      req: false, ejemplo: 'Tesoreria'           },
    ],
    preview: ['id_institucional', 'cargo', 'dependencia'],
    handler: (filas) => repo.cargarEmpleados(filas),
  },
  {
    key:         'contratistas',
    label:       'Contratistas',
    descripcion: 'Asigna el rol Contratista y registra la empresa.',
    obligatorio: false,
    color: { btn: 'bg-orange-500 hover:bg-orange-600', badge: 'bg-orange-50 text-orange-700' },
    columnas: [
      { key: 'id_institucional', label: 'ID Institucional', req: true, ejemplo: '80678901'               },
      { key: 'empresa',          label: 'Empresa',          req: true, ejemplo: 'Sistemas Avanzados SAS' },
    ],
    preview: ['id_institucional', 'empresa'],
    handler: (filas) => repo.cargarContratistas(filas),
  },
];

// --- Agregar usuario individual ---
const ROLES_CONFIG = [
  { key: 'estudiante', label: 'Estudiante', on: 'bg-blue-600 border-blue-600 text-white',   off: 'border-blue-300 text-blue-600 hover:bg-blue-50'   },
  { key: 'empleado',   label: 'Empleado',   on: 'bg-purple-600 border-purple-600 text-white', off: 'border-purple-300 text-purple-600 hover:bg-purple-50' },
  { key: 'contratista',label: 'Contratista',on: 'bg-orange-500 border-orange-500 text-white', off: 'border-orange-300 text-orange-500 hover:bg-orange-50' },
];

const AgregarUsuarioPanel = ({ onCerrar }) => {
  const [subPaso,   setSubPaso]  = useState(0);
  const [base,      setBase]     = useState({ id_institucional: '', documento_identidad: '', nombre_completo: '' });
  const [roles,     setRoles]    = useState([]);
  const [est,       setEst]      = useState({ programa_academico: '' });
  const [emp,       setEmp]      = useState({ cargo: '', dependencia: '' });
  const [con,       setCon]      = useState({ empresa: '' });
  const [cargando,  setCargando] = useState(false);
  const [error,     setError]    = useState(null);
  const [ok,        setOk]       = useState(false);

  const toggleRol = (key) =>
    setRoles(r => r.includes(key) ? r.filter(x => x !== key) : [...r, key]);

  const baseValido =
    base.id_institucional.trim() &&
    base.documento_identidad.trim() &&
    base.nombre_completo.trim() &&
    roles.length > 0;

  const rolesExtraValido =
    (!roles.includes('estudiante') || est.programa_academico.trim()) &&
    (!roles.includes('empleado')   || emp.cargo.trim()) &&
    (!roles.includes('contratista')|| con.empresa.trim());

  const guardar = async () => {
    setCargando(true);
    setError(null);
    try {
      await repo.cargarUsuarios([base]);
      if (roles.includes('estudiante'))
        await repo.cargarEstudiantes([{ id_institucional: base.id_institucional, ...est }]);
      if (roles.includes('empleado'))
        await repo.cargarEmpleados([{ id_institucional: base.id_institucional, ...emp }]);
      if (roles.includes('contratista'))
        await repo.cargarContratistas([{ id_institucional: base.id_institucional, ...con }]);
      setOk(true);
    } catch (e) {
      setError(e.message ?? 'Error al guardar el usuario.');
    } finally {
      setCargando(false);
    }
  };

  const reiniciarPanel = () => {
    setSubPaso(0);
    setBase({ id_institucional: '', documento_identidad: '', nombre_completo: '' });
    setRoles([]);
    setEst({ programa_academico: '' });
    setEmp({ cargo: '', dependencia: '' });
    setCon({ empresa: '' });
    setOk(false);
    setError(null);
  };

  if (ok) return (
    <div className="bg-white rounded-xl border border-green-200 shadow-sm p-6 text-center">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-ucc-green">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <p className="font-bold text-gray-800 mb-0.5">Usuario agregado</p>
      <p className="text-xs text-gray-500 mb-4">
        {base.nombre_completo} · {roles.join(', ')}
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={reiniciarPanel}
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Agregar otro
        </button>
        <button
          onClick={onCerrar}
          className="text-sm px-4 py-2 rounded-lg bg-ucc-green text-white hover:bg-ucc-green transition-colors"
        >
          Listo
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-800 text-sm">Agregar usuario</h3>
        <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Sub-paso 0: datos base + seleccion de roles */}
      {subPaso === 0 && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ID Institucional</label>
            <input
              type="text"
              value={base.id_institucional}
              onChange={e => setBase(b => ({ ...b, id_institucional: e.target.value.trim() }))}
              placeholder="ej. 80123456"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Documento de identidad</label>
            <input
              type="text"
              value={base.documento_identidad}
              onChange={e => setBase(b => ({ ...b, documento_identidad: e.target.value.trim() }))}
              placeholder="ej. 1001234567"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
            <input
              type="text"
              value={base.nombre_completo}
              onChange={e => setBase(b => ({ ...b, nombre_completo: e.target.value }))}
              placeholder="ej. Juan Perez Gomez"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Roles (selecciona al menos uno)</label>
            <div className="flex flex-wrap gap-2">
              {ROLES_CONFIG.map(({ key, label, on, off }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleRol(key)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${roles.includes(key) ? on : off}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSubPaso(1)}
            disabled={!baseValido}
            className="w-full text-sm bg-ucc-green text-white py-2.5 rounded-lg font-medium hover:bg-ucc-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continuar →
          </button>
        </div>
      )}

      {/* Sub-paso 1: datos especificos por rol */}
      {subPaso === 1 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Completa los datos para <span className="font-semibold text-gray-700">{base.nombre_completo}</span>
          </p>

          {roles.includes('estudiante') && (
            <div className="bg-blue-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Estudiante</p>
              <input
                type="text"
                value={est.programa_academico}
                onChange={e => setEst({ programa_academico: e.target.value })}
                placeholder="Programa academico *"
                className="w-full border border-blue-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {roles.includes('empleado') && (
            <div className="bg-purple-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Empleado</p>
              <input
                type="text"
                value={emp.cargo}
                onChange={e => setEmp(d => ({ ...d, cargo: e.target.value }))}
                placeholder="Cargo *"
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                value={emp.dependencia}
                onChange={e => setEmp(d => ({ ...d, dependencia: e.target.value }))}
                placeholder="Dependencia (opcional)"
                className="w-full border border-purple-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {roles.includes('contratista') && (
            <div className="bg-orange-50 rounded-lg p-3 space-y-2">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Contratista</p>
              <input
                type="text"
                value={con.empresa}
                onChange={e => setCon({ empresa: e.target.value })}
                placeholder="Empresa *"
                className="w-full border border-orange-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => { setSubPaso(0); setError(null); }}
              className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Atras
            </button>
            <button
              onClick={guardar}
              disabled={cargando || !rolesExtraValido}
              className="flex-1 text-sm bg-ucc-green text-white py-2 rounded-lg font-medium hover:bg-ucc-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : 'Guardar usuario'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// â”€â”€â”€ Vista principal: wizard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const CargarCSVView = () => {
  // paso: 0=semestre | 1-4=CSVs | 5=confirmar | 6=Ã©xito
  const [paso,      setPaso]      = useState(0);
  const [semestre,  setSemestre]  = useState({ nombre: '', fechaInicio: '', fechaFin: '' });
  const [staged,    setStaged]    = useState({ usuarios: null, estudiantes: null, empleados: null, contratistas: null });
  const [cargando,  setCargando]  = useState(false);
  const [error,     setError]     = useState(null);
  const [resultado, setResultado] = useState(null);

  // Estado local del paso CSV activo (se resetea al cambiar paso)
  const [csvFile,  setCsvFile]  = useState(null);
  const [csvFilas, setCsvFilas] = useState([]);
  const [csvFase,  setCsvFase]  = useState('idle'); // idle | preview | error
  const [csvError, setCsvError] = useState('');
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [agregarAbierto, setAgregarAbierto] = useState(false);

  const pasoConfig = paso >= 1 && paso <= 4 ? PASOS_CSV[paso - 1] : null;

  const semestreValido =
    semestre.nombre.trim() &&
    semestre.fechaInicio &&
    semestre.fechaFin &&
    semestre.fechaFin > semestre.fechaInicio;

  const resetCsvLocal = () => {
    setCsvFile(null); setCsvFilas([]); setCsvFase('idle'); setCsvError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const irAPaso = (nuevo) => { setPaso(nuevo); resetCsvLocal(); };

  const handleArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parsearCSV(ev.target.result);
        if (parsed.length === 0) {
          setCsvError('El archivo no tiene registros validos o los encabezados no coinciden.');
          setCsvFase('error');
          return;
        }
        setCsvFilas(parsed);
        setCsvFase('preview');
      } catch {
        setCsvError('Error al leer el archivo. Verifica que sea un CSV valido.');
        setCsvFase('error');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      setCsvError('El archivo debe ser un .csv');
      setCsvFase('error');
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parsearCSV(ev.target.result);
        if (parsed.length === 0) {
          setCsvError('El archivo no tiene registros validos o los encabezados no coinciden.');
          setCsvFase('error');
          return;
        }
        setCsvFilas(parsed);
        setCsvFase('preview');
      } catch {
        setCsvError('Error al leer el archivo. Verifica que sea un CSV valido.');
        setCsvFase('error');
      }
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const confirmarCSV = () => {
    setStaged(prev => ({ ...prev, [pasoConfig.key]: csvFilas }));
    irAPaso(paso + 1);
  };

  const omitirCSV = () => {
    setStaged(prev => ({ ...prev, [pasoConfig.key]: null }));
    irAPaso(paso + 1);
  };

  const handleEmpezarSemestre = async () => {
    setCargando(true);
    setError(null);
    try {
      await repo.iniciarNuevoSemestre(semestre.nombre.trim(), semestre.fechaInicio, semestre.fechaFin);
      const res = {};
      if (staged.usuarios?.length)     res.usuarios     = await repo.cargarUsuarios(staged.usuarios);
      if (staged.estudiantes?.length)  res.estudiantes  = await repo.cargarEstudiantes(staged.estudiantes);
      if (staged.empleados?.length)    res.empleados    = await repo.cargarEmpleados(staged.empleados);
      if (staged.contratistas?.length) res.contratistas = await repo.cargarContratistas(staged.contratistas);
      setResultado(res);
      setPaso(6);
    } catch (err) {
      setError(err.message ?? 'Error al iniciar el semestre');
    } finally {
      setCargando(false);
    }
  };

  const reiniciar = () => {
    setPaso(0);
    setSemestre({ nombre: '', fechaInicio: '', fechaFin: '' });
    setStaged({ usuarios: null, estudiantes: null, empleados: null, contratistas: null });
    setCargando(false); setError(null); setResultado(null);
    resetCsvLocal();
  };

  const formatearFecha = (iso) =>
    iso ? new Date(iso + 'T12:00:00').toLocaleDateString('es-CO', {
      day: '2-digit', month: 'long', year: 'numeric',
    }) : '—';

  // â”€â”€ Pantalla de Ã©xito â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (paso === 6) {
    const total = Object.values(resultado ?? {}).reduce((s, r) => s + (r?.insertados ?? 0), 0);
    return (
      <div className="space-y-5 max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-ucc-green">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-1">¡Semestre {semestre.nombre} iniciado!</h2>
          <p className="text-gray-500 text-sm mb-6">{total} registros cargados en total</p>
          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            {[
              { label: 'Usuarios',     key: 'usuarios',     color: 'bg-gray-50   text-gray-700'   },
              { label: 'Estudiantes',  key: 'estudiantes',  color: 'bg-blue-50   text-blue-700'   },
              { label: 'Empleados',    key: 'empleados',    color: 'bg-purple-50 text-purple-700' },
              { label: 'Contratistas', key: 'contratistas', color: 'bg-orange-50 text-orange-700' },
            ].map(({ label, key, color }) => (
              <div key={key} className={`rounded-xl p-3 text-left ${color}`}>
                <p className="font-medium text-xs mb-0.5">{label}</p>
                <p className="text-lg font-bold">
                  {resultado?.[key]?.insertados ?? <span className="text-sm opacity-50">Omitido</span>}
                </p>
              </div>
            ))}
          </div>
          <button onClick={reiniciar} className="text-sm px-5 py-2.5 rounded-lg bg-ucc-green text-white hover:bg-ucc-green transition-colors">
            Iniciar otro semestre
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      <Stepper pasoActual={paso} />

      {/* â”€â”€â”€ Paso 0: InformaciÃ³n del semestre â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {paso === 0 && (
        <div className="flex flex-wrap items-start gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 w-full max-w-sm">
          <h3 className="font-bold text-gray-800 mb-1">Informacion del nuevo semestre</h3>
          <p className="text-sm text-gray-400 mb-5">
            Al confirmar al final, los datos del semestre anterior seran eliminados y estos los reemplazaran.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nombre del semestre</label>
              <input
                type="text"
                value={semestre.nombre}
                onChange={e => setSemestre(s => ({ ...s, nombre: e.target.value }))}
                placeholder="ej. 2026-1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha de inicio</label>
                <input
                  type="date"
                  value={semestre.fechaInicio}
                  onChange={e => setSemestre(s => ({ ...s, fechaInicio: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fecha de fin</label>
                <input
                  type="date"
                  value={semestre.fechaFin}
                  onChange={e => setSemestre(s => ({ ...s, fechaFin: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ucc-green"
                />
              </div>
            </div>
            {semestre.fechaInicio && semestre.fechaFin && !semestreValido && (
              <p className="text-xs text-red-500">La fecha de fin debe ser posterior a la de inicio.</p>
            )}
          </div>
          <div className="mt-6 flex items-center justify-between gap-2">
              <button
                onClick={() => setAgregarAbierto(a => !a)}
                className={`text-sm border px-4 py-2 rounded-lg transition-colors ${
                  agregarAbierto
                    ? 'bg-ucc-green text-white border-ucc-green hover:bg-ucc-green'
                    : 'text-ucc-green border-ucc-green hover:bg-green-50'
                }`}
              >
                {agregarAbierto ? '✕ Cerrar panel' : '+ Agregar usuario'}
              </button>
              <button
                onClick={() => irAPaso(1)}
                disabled={!semestreValido}
                className="text-sm bg-ucc-green text-white px-5 py-2.5 rounded-lg hover:bg-ucc-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Iniciar semestre
              </button>
            </div>
          </div>

          {/* Panel agregar usuario (aparece al lado) */}
          {agregarAbierto && (
            <div className="w-full max-w-sm">
              <AgregarUsuarioPanel onCerrar={() => setAgregarAbierto(false)} />
            </div>
          )}

        </div>
      )}

      {/* â”€â”€â”€ Pasos 1â€“4: CSVs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {paso >= 1 && paso <= 4 && pasoConfig && (
        <div className="space-y-4">

          {/* Cabecera del paso */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${pasoConfig.color.badge}`}>
              {pasoConfig.label}
            </span>
            <p className="text-sm text-gray-500 flex-1">{pasoConfig.descripcion}</p>
            {!pasoConfig.obligatorio && (
              <span className="text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-md flex-shrink-0">
                Opcional
              </span>
            )}
          </div>

          {/* Formato esperado (siempre visible) */}
          <TablaFormato columnas={pasoConfig.columnas} />

          {/* Zona de subida */}
          {csvFase === 'idle' && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`rounded-xl border-2 border-dashed p-10 text-center shadow-sm transition-all duration-150 ${
                dragOver
                  ? 'border-green-500 bg-green-50'
                  : 'bg-white border-gray-300'
              }`}
            >
              {dragOver ? (
                <p className="text-ucc-green font-bold text-lg py-4">
                  ↓ Suelta el archivo aqui
                </p>
              ) : (
                <>
                  <p className="text-gray-700 font-semibold mb-1">
                    Selecciona o arrastra el CSV de <span className="lowercase">{pasoConfig.label}</span>
                  </p>
                  <p className="text-gray-400 text-xs mb-5">Archivo .csv — separado por comas — codificacion UTF-8</p>
                  <label className={`cursor-pointer inline-block text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors ${pasoConfig.color.btn}`}>
                    Elegir archivo
                    <input ref={inputRef} type="file" accept=".csv" onChange={handleArchivo} className="hidden" />
                  </label>
                </>
              )}
            </div>
          )}

          {/* Preview */}
          {csvFase === 'preview' && (
            <TablaPreview filas={csvFilas} previewCols={pasoConfig.preview} archivo={csvFile} />
          )}

          {/* Error de parseo */}
          {csvFase === 'error' && (
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-8 text-center">
              <p className="text-red-600 font-medium text-sm mb-3">{csvError}</p>
              <button onClick={resetCsvLocal} className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Intentar de nuevo
              </button>
            </div>
          )}

          {/* Navegacion */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => irAPaso(paso - 1)}
              className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Atras
            </button>
            <div className="flex gap-2">
              {!pasoConfig.obligatorio && (
                <button
                  onClick={omitirCSV}
                  className="text-sm text-gray-500 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Omitir
                </button>
              )}
              <button
                onClick={confirmarCSV}
                disabled={csvFase !== 'preview'}
                className={`text-sm text-white px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${pasoConfig.color.btn}`}
              >
                {paso === 4 ? 'Revisar y enviar →' : `Confirmar ${pasoConfig.label} →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€ Paso 5: Confirmacion final â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {paso === 5 && (
        <div className="space-y-4 max-w-lg">

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-amber-800 mb-2">
              ⚠ Esta accion eliminara todos los datos del semestre anterior
            </p>
            <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
              <li>Todos los usuarios, roles y fallas actuales seran borrados</li>
              <li>Se cargaran los CSV que preparaste en los pasos anteriores</li>
              <li>Esta accion no se puede deshacer</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="font-bold text-gray-800 text-sm">Resumen del nuevo semestre</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Semestre</span>
                <span className="font-bold text-gray-800">{semestre.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Inicio</span>
                <span className="text-gray-700">{formatearFecha(semestre.fechaInicio)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fin</span>
                <span className="text-gray-700">{formatearFecha(semestre.fechaFin)}</span>
              </div>
            </div>
            <div className="border-t border-gray-50 pt-3 grid grid-cols-2 gap-2 text-xs">
              {[
                { label: 'Usuarios',     key: 'usuarios',     color: 'bg-gray-50   text-gray-700'   },
                { label: 'Estudiantes',  key: 'estudiantes',  color: 'bg-blue-50   text-blue-700'   },
                { label: 'Empleados',    key: 'empleados',    color: 'bg-purple-50 text-purple-700' },
                { label: 'Contratistas', key: 'contratistas', color: 'bg-orange-50 text-orange-700' },
              ].map(({ label, key, color }) => (
                <div key={key} className={`rounded-lg px-3 py-2 flex justify-between items-center ${color}`}>
                  <span className="font-medium">{label}</span>
                  <span className="font-bold">
                    {staged[key]?.length
                      ? `${staged[key].length} reg.`
                      : <span className="opacity-40">Omitido</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <p className="text-xs text-red-700 font-medium">Error al procesar:</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => irAPaso(4)}
              disabled={cargando}
              className="text-sm text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              ← Atras
            </button>
            <button
              onClick={handleEmpezarSemestre}
              disabled={cargando || !staged.usuarios?.length}
              className="flex items-center gap-2 text-sm bg-ucc-green text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ucc-green transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Empezar semestre {semestre.nombre}
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

