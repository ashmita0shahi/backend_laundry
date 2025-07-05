const config = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: process.env.PORT || 5000,
  environment: process.env.NODE_ENV || 'development',
  khalti: {
    publicKey: process.env.KHALTI_PUBLIC_KEY,
    secretKey: process.env.KHALTI_SECRET_KEY,
  },
};

module.exports = config;