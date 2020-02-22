import "@babel/polyfill";

import app from "./app";
import vars from "./envvars";

const { port } = vars;

const listener = app.listen(port, function() {
  console.log(`Listening on port: ${listener.address().port}`);
});
