import "@babel/polyfill";

import app from "./app";
import db from "./db";
import vars from "./envvars";

const { port } = vars;

const serve = async () => {
  await db.asyncConnect();
  const listener = app.listen(port, () => {
    console.log(`Listening on port: ${listener.address().port}`);
  });
};

serve();
