require('dotenv').config({ path: '../frontend/.env' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_CTV_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_CTV_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
// Using the anon key to run DDL (CREATE TABLE) will fail because of RLS and lack of permissions.
// To run raw SQL, we usually need the service_role key or we must do it via the Supabase Dashboard SQL Editor directly.
// Let's check if there's a service role key in the backend .env or somewhere else.
console.log("URL:", supabaseUrl ? "Found" : "Missing", "Key:", supabaseKey ? "Found" : "Missing");
