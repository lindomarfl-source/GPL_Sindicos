const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

const envConfig = dotenv.parse(fs.readFileSync('.env.local'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
    .from('visitas')
    .update({ hora_visita: '16:35:00' })
    .eq('id', 'd5069651-c43b-44de-8c09-d14d87e61c76')
    .select();
  
  console.log("Error:", error);
  console.log("Data:", data);
}

test();
