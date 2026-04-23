import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log de depuração do cliente (aparecerá no console do seu navegador F12)
console.log('📡 Supabase URL configurada:', supabaseUrl ? '✅ Sim' : '❌ Não');
console.log('🔑 Supabase Key configurada:', supabaseAnonKey ? '✅ Sim' : '❌ Não');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('SUA_URL_AQUI')) {
  console.error('🚨 ERRO CRÍTICO: As chaves do Supabase não foram configuradas corretamente no arquivo .env ou o Vite não reiniciou.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    db: { schema: 'sindico' }
  }
);
