import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import bodyparser from "body-parser";
import errorhandler from "errorhandler";
import db from "./db";
import passportSettings from "./config/passport";
import config from "./envvars";
import mainRouter from "./routes/main";

const isProduction = config.node_env === "production";
const connectDB = db.connect;

passport.use("local", passportSettings.customLocalStrategy);
passport.use("session", passportSettings.sessionStrategy);
// passport.serializeUser(passportSettings.serializer);
// passport.deserializeUser(passportSettings.deserializer);

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyparser.urlencoded({ extended: true }));

app.use(passport.initialize());
// app.use(passport.session());

mongoose.set("useNewUrlParser", true);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

if (!isProduction) {
  app.use(errorhandler());
}

connectDB();

// Register routes here
app.use("/api", mainRouter);

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
