import moment from "moment";
import db from "../db";
import ip from "../utils/ip";

const User = db.models.user;
const getIP = ip.fn;

const createUser = async (req, res, next) => {
  const user = new User(req.body.user);
  const now = moment();

  user.timestamp_register = now;
  user.activated = now;
  user.register_ip = getIP(req);

  const restrictedFields = [
    "last_login_ip",
    "timestamp_last_login",
    "deactivated",
    "verified"
  ];
  restrictedFields.forEach(key => {
    delete user[key];
  });
  user.save();
  res.status(201).json({ data: user });
};

export default {
  create: createUser
};
