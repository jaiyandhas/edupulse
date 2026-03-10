require('dotenv').config({ path: '../frontend/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.VITE_CTV_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.VITE_CTV_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

supabase.from('questions').select('id, subject, difficulty').limit(5).then(res => {
    console.log('Questions found:', res.data ? res.data.length : 0);
    if (res.error) console.error('Error:', res.error);
    if (res.data) console.log(res.data);
});
