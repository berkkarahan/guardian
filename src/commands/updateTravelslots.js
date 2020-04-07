import "@babel/polyfill";
import { uuid } from "uuidv4";
import { argv } from "yargs";
import csv from "csv-parser";
import fs from "fs";
import db from "../db";
import config from "../envvars";

const Travelslot = db.models.travelslots;

const HEADERS = ["uuid", "petAllowed", "luxuryCategory"];
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
        throw new Error("csv headers are corrupt.");
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
        const intPetAllowed = parseInt(row.petAllowed, 10);
        const travelslot = await Travelslot.findOne({ uuid: row.uuid });
        if (intPetAllowed === 1) {
          travelslot.petAllowed = true;
        } else if (intPetAllowed === 0) {
          travelslot.petAllowed = false;
        }
        travelslot.luxuryCategory = row.luxuryCategory.trim();
        await travelslot.save();
      }
      process.exit();
    });
}
