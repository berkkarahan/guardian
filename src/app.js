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
import AdminBroOptions from "./config/adminbro/options";
import passportSettings from "./config/passport";
import config from "./envvars";
import mainRouter from "./routes/main";
import tryCatch from "./utils/catcher";
import limiter from "./routes/limiter";

//Setup adminbro
const adminBro = new AdminBro(AdminBroOptions);

const ADMIN = {
  email: config.admin_email,
  password: config.admin_pwd
};

const isProduction = config.node_env === "production";

// Mongo-db store for express session
const MongoStore = mongostore(session);
const sessionMongoStore = new MongoStore({
  mongooseConnection: mongoose.connection
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
      if (ADMIN.password === password && ADMIN.email === email) {
        return ADMIN;
      }
      return null;
    },
    cookieName: "adminbro",
    cookiePassword: config.cookie_secret
  },
  predefinedBroRouter,
  { resave: false, saveUninitialized: false, store: sessionMongoStore }
);

app.use(adminBro.options.rootPath, adminRouter);
app.use(helmet());
app.use(cors({ credentials: true, origin: true }));
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser(config.cookie_secret));
app.use(
  session({
    secret: config.cookie_secret,
    resave: false,
    saveUninitialized: false,
    store: sessionMongoStore
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

if (!isProduction) {
  app.use(errorhandler());
}

// Register general limiter
app.use("/api/", limiter.general);
// Register routes here
app.use("/api", mainRouter);
app.get("/", (req, res, next) => {
  res.redirect(config.fe_url);
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
