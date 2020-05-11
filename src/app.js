import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import bodyparser from "body-parser";
import session from "express-session";
import cookieparser from "cookie-parser";
import errorhandler from "errorhandler";
import AdminBro from "admin-bro";
import AdminBroExpress from "admin-bro-expressjs";
import mongostore from "connect-mongo";
import rateLimit from "express-rate-limit";
import RateLimitMongo from "rate-limit-mongo";
import AdminBroOptions from "./config/adminbro/options";
import passportSettings from "./config/passport";
import config from "./envvars";
import mainRouter from "./routes/main";
import tryCatch from "./utils/catcher";
import db from "./db";
import jwtAuth from "./config/jwtAuth";

// User model
const User = db.models.user;

// setup rate-limiter
const generalLimiter = rateLimit({
  store: new RateLimitMongo({
    uri: config.mongo_prod
  }),
  max: 100,
  windowMs: 15 * 60 * 1000
});

//Setup adminbro
const adminBro = new AdminBro(AdminBroOptions);

// Change this to ADMIN users of the system, not a static admin user
const ADMIN = {
  email: config.admin_email,
  password: config.admin_pwd
};
const staticAdminAuth = async (email, password) => {
  if (ADMIN.password === password && ADMIN.email === email) {
    return ADMIN;
  }
  return null;
};

const dbAdminAuth = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (user) {
    const pwdComparison = user.comparePassword(password);
    if (pwdComparison) {
      return {
        email: email,
        password: password
      };
    }
  }
  return null;
};

const broAuth = async (email, password, authType) => {
  switch (authType) {
    case "static":
      return await staticAdminAuth(email, password);
    case "database":
      return await dbAdminAuth(email, password);
    default:
      break;
  }
};

const isProduction = config.node_env === "production";

// Mongo-db store for express session
const MongoStore = mongostore(session);
const broMongoSession = new MongoStore({
  mongooseConnection: mongoose.connection,
  collection: "broSessions"
});

// Passport serialization settings for session
passport.use("local", passportSettings.customLocalStrategy);
passport.serializeUser(passportSettings.localSerializeUser);
passport.deserializeUser(passportSettings.localDeserializer);

const app = express();

// Admin bro settings for the admin page
const predefinedBroRouter = express.Router();
const adminRouter = AdminBroExpress.buildAuthenticatedRouter(
  adminBro,
  {
    authenticate: async (email, password) => {
      return await broAuth(email, password, "static");
    },
    cookieName: "adminbro",
    cookiePassword: config.cookie_secret
  },
  predefinedBroRouter,
  {
    name: "bro.session.id",
    secret: config.cookie_secret,
    resave: false,
    saveUninitialized: false,
    store: broMongoSession,
    cookie: { httpOnly: false }
  }
);

const corsConfig = {
  origin: true,
  credentials: true,
  exposedHeaders: ["X-Max-Pages", "X-Total-Count"]
};

app.use(adminBro.options.rootPath, adminRouter);
app.use(helmet());
app.use(cors(corsConfig));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser(config.cookie_secret));

app.use(passport.initialize());
// app.use(passport.session());

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

if (!isProduction) {
  app.use(errorhandler());
}

// set token to req context
app.use(jwtAuth.middleware);
// Register general limiter
app.use("/api/", generalLimiter);
// Register routes here
app.use("/api", mainRouter);
app.get("/", (req, res, next) => {
  res.redirect(`${config.fe_url}/index.html`);
});

const pong = tryCatch(async (req, res, next) => {
  res.json({ message: "pong" });
});
app.get("/ping", pong);

const error = tryCatch(async (req, res, next) => {
  throw new Error("Error route.");
});
app.get("/error", error);

if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    const status = err.status || 500;

    res.status(status);

    res.json({
      errors: {
        message: err.message,
        error: err,
        status: status,
        stack: JSON.stringify(err.stack, null, 2)
      }
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    errors: {
      message: err.message,
      error: {}
    }
  });
});

export default app;
