import { createClient } from '@supabase/supabase-js';

// Usa el hostname del navegador para que funcione tanto desde localhost
// como desde cualquier IP de la red (ej: http://172.13.0.209)
const SUPABASE_URL = `http://${window.location.hostname}:3000`;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
