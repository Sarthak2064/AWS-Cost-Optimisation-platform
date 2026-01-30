const validateEnv = () => {
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ONSPACE_AI_API_KEY',
    'ONSPACE_AI_BASE_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Optional but recommended for IAM role authentication
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('Warning: AWS credentials not configured. IAM role authentication will not work.');
  }
};

const getConfig = () => {
  return {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    supabase: {
      url: process.env.SUPABASE_URL,
      anonKey: process.env.SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    },
    onspaceAi: {
      apiKey: process.env.ONSPACE_AI_API_KEY,
      baseUrl: process.env.ONSPACE_AI_BASE_URL
    },
    aws: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:5173']
    }
  };
};

module.exports = {
  validateEnv,
  getConfig
};
