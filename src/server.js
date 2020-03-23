import "@babel/polyfill";

import app from "./app";
import db from "./db";
import vars from "./envvars";

const { port } = vars;

(function() {
  db.connect()
    .then(conn => {
      console.log(
        `Database connected on host: ${conn.connections[0].host} with port: ${conn.connections[0].port}`
      );
    })
    .then(() => {
      const listener = app.listen(port, () => {
        console.log(`Listening on port: ${listener.address().port}`);
      });
    });
})();
