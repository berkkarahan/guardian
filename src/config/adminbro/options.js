import AdminBro from "admin-bro";
import AdminBroMongoose from "admin-bro-mongoose";
import db from "../../db";

AdminBro.registerAdapter(AdminBroMongoose);

const User = db.models.user;
const Company = db.models.company;
const Travelslots = db.models.travelslots;

const menu = {
  mongoose: { name: "mongooseResources", icon: "SpineLabel" }
};

const options = {
  resources: [
    { resource: User, options: { parent: menu.mongoose } },
    { resource: Company, options: { parent: menu.mongoose } },
    { resource: Travelslots, options: { parent: menu.mongoose } }
  ],
  rootPath: "/admin"
};

export default options;
