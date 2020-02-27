require("dotenv").config();

const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwt_secret: process.env.JWT_SECRET,
  jwt_issuer: process.env.JWT_ISSUER,
  jwt_expiresin: process.env.JWT_EXPIRESIN,
  mongo_test: process.env.MONGODB_URI_TEST,
  mongo_prod: process.env.MONGODB_URI,
  mongo_dev: process.env.MONGODB_URI
};

console.log(config);

export default config;
