import React, { useState } from 'react';

// Simple, standalone login form for sharing with a designer/friend.
// Props:
// - onSubmit: async function({ idInstitucional, remember }) => void
// - logo: URL string for the logo image (optional)
// - primaryColor: CSS color string for main accent (optional)
export const LoginFormPlain = ({ onSubmit, logo, primaryColor = 'var(--ucc-green)' }) => {
  const [id, setId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!id) return setError('Ingrese su ID institucional');
    setLoading(true);
    try {
      await onSubmit?.({ idInstitucional: id, remember });
    } catch (err) {
      setError(err?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 380, margin: '0 auto', padding: 20, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
        <div style={{ textAlign: 'center' }}>
          {logo ? (
            <img src={logo} alt="logo" style={{ height: 64, objectFit: 'contain', marginBottom: 8 }} />
          ) : (
            <div style={{ height: 64, width: 64, margin: '0 auto 8px', borderRadius: 8, background: primaryColor }} />
          )}
          <h3 style={{ margin: 0, fontSize: 18, color: '#111' }}>Iniciar sesión</h3>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#666' }}>Ingrese su ID institucional</p>
        </div>

        <label style={{ fontSize: 12, color: '#444' }}>ID institucional</label>
        <input
          type="text"
          value={id}
          onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setId(v); }}
          placeholder="80123456"
          inputMode="numeric"
          style={{
            padding: '12px 14px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 15,
            outline: 'none',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#444' }}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span>Recordarme</span>
          </label>
          <a href="#" style={{ fontSize: 13, color: primaryColor, textDecoration: 'none' }}>¿Olvidó su ID?</a>
        </div>

        {error && (
          <div style={{ padding: 10, background: '#fee', border: '1px solid #f9c', borderRadius: 8, color: '#800' }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: primaryColor,
            color: '#fff',
            padding: '12px 14px',
            borderRadius: 10,
            border: 'none',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#888' }}>
          <small>Esta versión es solo diseño plano — no conecta a ningún backend.</small>
        </div>
      </form>
    </div>
  );
};

export default LoginFormPlain;
