const { createClient } = require('@supabase/supabase-js');

// Security & Architecture Reasoning:
// We use Supabase (PostgreSQL + pgvector) to store and perform semantic searches 
// on known attack patterns. The environment variables are heavily relied upon 
// to avoid hardcoding any credentials in the source code.

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn("⚠️  Supabase URL or Key is missing. Vector search capabilities will be unavailable.");
}

// Initialize the Supabase client
const supabase = createClient(
    supabaseUrl || 'http://placeholder.supabase.co', 
    supabaseKey || 'placeholder_key'
);

module.exports = supabase;
