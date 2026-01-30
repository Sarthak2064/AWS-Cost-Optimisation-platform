const { createClient } = require('@supabase/supabase-js');
const { getConfig } = require('./env');

const config = getConfig();

// Create Supabase client with anon key (for user authentication)
const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
);

// Create Supabase admin client with service role key (for admin operations)
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper to create client with user token
const createUserClient = (token) => {
  return createClient(
    config.supabase.url,
    config.supabase.anonKey,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

module.exports = {
  supabase,
  supabaseAdmin,
  createUserClient
};
