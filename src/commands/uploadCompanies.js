// import "@babel/polyfill";
import { uuid } from "uuidv4";
import { argv } from "yargs";
import csv from "csv-parser";
import fs from "fs";
import db from "../db";
import config from "../envvars";

const HEADERS = ["name"];
const ROWS = [];
const Company = db.models.company;

if (!argv.file) {
  console.log("--file flag can't be empty.");
  console.log("Sample usage:");
  console.log("     ./uploacCompanies.js --file=sample.csv");
} else {
  db.connectUri(config.mongo_cloud);
  const filePath = argv.file;
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("headers", headers => {
      const difference = HEADERS.filter(x => !headers.includes(x));
      if (difference.length !== 0) {
        throw new Error(
          'csv headers are corrupt. Headers should contain "name"'
        );
      }
    })
    .on("data", data => {
      ROWS.push(data);
    })
    .on("end", async () => {
      for (let i = 0; i < ROWS.length; i++) {
        const row = ROWS[i];
        console.log("Index: ", i);
        console.log("Row data: ", row);
        const company = new Company();
        company.name = row.name;
        company.recordVerified = true;
        company.uuid = uuid();
        console.log(company);
        await company.save();
      }
      process.exit();
    });
}
