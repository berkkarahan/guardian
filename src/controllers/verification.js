import db from "../db";

const Token = db.models.token;
const User = db.models.user;

// served over a GET request
const validateVerification = async (req, res, next) => {
  const tokenUUID = req.query.uuid;
  const token = await Token.findOne({ token_uuid: tokenUUID });
  const verificationResult = await token.verifyUser();
  if (!verificationResult) {
    res.status(403).send();
  }
  res.status(201).send();
};

// POST request, requires local authorization with passport
const createVerification = async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const token = new Token();
  await token.generateVerificationToken(user);
  await res.status(201).json(token);
};

export default {
  validate: validateVerification,
  create: createVerification
};
