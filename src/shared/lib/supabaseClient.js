import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zhljlbuwpezwgkpwvkeu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_wmcyhNSE68bZ9fW8v1PsMg_Va7sIKe-';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
