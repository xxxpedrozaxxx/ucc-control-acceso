/**
 * Paleta corporativa UCC — fuente única de color para JS/JSX.
 *
 * Uso en Recharts, style props, o cualquier lugar donde Tailwind no llega:
 *
 *   import { UCC, CHART_COLORS } from '@/shared/styles/theme';
 *
 *   <Cell fill={UCC.green} />
 *   <Bar fill={UCC.cyan}   />
 *   style={{ backgroundColor: UCC.lima }}
 *
 * En Tailwind (clases CSS) usa directamente los tokens:
 *   bg-ucc-green   text-ucc-cyan   border-ucc-sage
 *   hover:bg-ucc-green-dark        bg-ucc-lima
 */

// ── Colores del logo UCC ──────────────────────────────────────────────────
export const UCC = {
  lima:      '#ccd617',   // Amarillo-lima  — acento vibrante
  cyan:      '#03abc7',   // Cian           — color secundario de marca
  sage:      '#e3e9dc',   // Verde salvia   — fondos suaves
  gray:      '#5f5d5e',   // Gris carbón    — texto y neutros
  green:     '#82bb2a',   // Verde          — color primario de marca
  sky:       '#82dbe8',   // Cian claro     — variante light del cian

  // Variantes funcionales
  greenDark: '#5a8a1a',   // Verde oscuro   — hover / sidebar activo
  cyanDark:  '#027a91',   // Cian oscuro    — hover de acento cyan
  bg:        '#f7f8f5',   // Fondo general  — sage muy claro
};

// ── Paleta para gráficas (Recharts) ──────────────────────────────────────
export const CHART_COLORS = {
  primary:   UCC.green,
  secondary: UCC.cyan,
  accent:    UCC.lima,
  danger:    '#EF4444',   // Rojo estándar  — bloqueados / alertas
  muted:     '#D1D5DB',   // Gris claro     — barras vacías
};

// Secuencia de colores para gráficas multi-serie
export const CHART_PALETTE = [
  UCC.green,
  UCC.cyan,
  UCC.lima,
  UCC.sky,
  '#F4A261',   // naranja suave
  '#E76F51',   // coral
  '#264653',   // azul oscuro
  '#6A4C93',   // violeta
  '#1982C4',   // azul
  UCC.gray,
];
