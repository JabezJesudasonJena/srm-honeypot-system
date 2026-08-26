require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const Redis = require('ioredis');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function verify() {
  console.log('Verifying environment...');
  
  // 1. Redis
  try {
    const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    await redis.ping();
    console.log('✅ Redis is reachable');
    redis.disconnect();
  } catch (err) {
    console.error('❌ Redis error:', err.message);
  }

  // 2. Supabase (Postgres)
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    // Simple query to verify connection
    const { data, error } = await supabase.from('knowledge_base').select('id').limit(1);
    if (error && error.code !== '42P01') {
       throw error;
    }
    console.log('✅ Supabase (Postgres) is reachable');
  } catch (err) {
    console.error('❌ Supabase error:', err.message);
  }

  // 3. Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("Respond with exactly 'OK'");
    const text = result.response.text().trim();
    if (text.includes('OK')) {
      console.log('✅ Gemini API is reachable and valid');
    } else {
      console.log('⚠️ Gemini returned unexpected response:', text);
    }
  } catch (err) {
    console.error('❌ Gemini API error:', err.message);
  }
}

verify();
