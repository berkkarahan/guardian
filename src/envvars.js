require("dotenv").config();

const config = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  cookie_secret: process.env.COOKIE_SECRET,
  jwt_secret: process.env.JWT_SECRET,
  jwt_issuer: process.env.JWT_ISSUER,
  jwt_expiresin: process.env.JWT_EXPIRESIN,
  mongo_test: process.env.MONGODB_URI_TEST,
  mongo_prod: process.env.MONGODB_URI,
  mongo_dev: process.env.MONGODB_URI,
  mongo_cloud: process.env.MONGO_URI_CLOUD,
  fe_url: process.env.FE_URL,
  admin_email: process.env.ADMIN_EMAIL,
  admin_pwd: process.env.ADMIN_PWD,
  sender_email: process.env.SENDER_EMAIL,
  sender_pwd: process.env.SENDER_PWD
};

export default config;
