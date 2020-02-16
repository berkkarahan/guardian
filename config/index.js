import "dotenv";

const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  jwt_issuer: process.env.JWT_ISSUER,
  jwt_expiresin: process.env.JWT_EXPIRESIN
};

export default config;
