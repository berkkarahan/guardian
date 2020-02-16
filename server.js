import "@babel/polyfill";

import app from "./app";
import { port } from "./config/index";

const listener = app.listen(port, function() {
  console.log(`Listening on port: ${listener.address().port}`);
});
