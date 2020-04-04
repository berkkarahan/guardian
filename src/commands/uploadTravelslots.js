import "@babel/polyfill";
import { uuid } from "uuidv4";
import { argv } from "yargs";
import csv from "csv-parser";
import fs from "fs";
import db from "../db";
import config from "../envvars";

const Company = db.models.company;
const Travelslot = db.models.travelslots;

const HEADERS = ["fromCity", "toCity", "compUUID", "fromHour", "fromMinute"];
const ROWS = [];

if (!argv.file) {
  console.log("--file flag can't be empty.");
  console.log("Sample usage:");
  console.log("     ./uploadTravelslots.js --file=sample.csv");
} else {
  db.connectUri(config.mongo_cloud);
  const filePath = argv.file;
  fs.createReadStream(filePath)
    .pipe(csv())
    .on("headers", headers => {
      console.log(headers);
      const difference = HEADERS.filter(x => !headers.includes(x));
      if (difference.length !== 0) {
        throw new Error(
          'csv headers are corrupt. Headers should contain "fromCity", "toCity", "compUUID", "fromHour", "fromMinute"'
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
        const travelslot = new Travelslot();
        const company = await Company.findOne({ uuid: row.compUUID });
        if (!company) {
          throw new Error(`Company with uuid: ${row.compUUID} does not exist`);
          process.exit();
        } else {
          console.log(company);
        }
        const fromHour = parseInt(row.fromHour, 10);
        const fromMinute = parseInt(row.fromMinute, 10);

        travelslot.uuid = uuid();
        travelslot.company = company;
        travelslot.fromHour = fromHour;
        travelslot.fromMinute = fromMinute;
        travelslot.fromCity = row.fromCity;
        travelslot.toCity = row.toCity;
        await travelslot.save();
      }
      process.exit();
    });
}
