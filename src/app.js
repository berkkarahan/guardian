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

//Setup adminbro
const adminBro = new AdminBro(AdminBroOptions);

const ADMIN = {
  email: config.admin_email,
  password: config.admin_pwd
};

const isProduction = config.node_env === "production";

const MongoStore = mongostore(session);

passport.use("local", passportSettings.customLocalStrategy);
// passport.use("session", passportSettings.sessionStrategy);
passport.serializeUser(passportSettings.localSerializeUser);
passport.deserializeUser(passportSettings.localDeserializer);

const app = express();

const adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  authenticate: async (email, password) => {
    if (ADMIN.password === password && ADMIN.email === email) {
      return ADMIN;
    }
    return null;
  },
  cookieName: "adminbro",
  cookiePassword: config.cookie_secret
});

app.use(adminBro.options.rootPath, adminRouter);
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cookieparser(config.cookie_secret));
app.use(
  session({
    secret: config.cookie_secret,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("useNewUrlParser", true);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

if (!isProduction) {
  app.use(errorhandler());
}

// Register routes here
app.use("/api", mainRouter);
app.get("/", (req, res, next) => {
  res.redirect(config.fe_url);
});
app.get("/ping", (req, res, next) => {
  res.json({ message: "pong" });
});

if (!isProduction) {
  app.use(function(err, req, res, next) {
    console.log(err.stack);

    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: err
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
