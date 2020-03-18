import db from "../db";

const Token = db.models.token;
const User = db.models.user;

// served over a GET request
const validateVerification = async (req, res, next) => {
  const tokenUUID = req.query.uuid;
  const token = await Token.findOne({ token_uuid: tokenUUID });

  if (!token) {
    res.status(403).send();
  }

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

// served over a POST request.
const validatePasswordReset = async (req, res, next) => {
  const { tokenUUID, user } = req.body;
  const token = await Token.findOne({ token_uuid: tokenUUID });

  if (!token) {
    res.status(403).send();
  }

  const passwordResetResult = await token.resetPassword(user.password);
  if (!passwordResetResult) {
    res.status(403).send();
  }
  res.status(201).send();
};

// POST request, send 200 regarldess of user found or not
const createPasswordReset = async (req, res, next) => {
  const { user } = req.body;
  const dbUser = await User.findOne({ email: user.email });
  if (dbUser) {
    const token = new Token();
    await token.generatePasswordResetToken(dbUser);
  }
  // implement email sending logic here
  res.status(200).send();
};

export default {
  password: { validate: validatePasswordReset, create: createPasswordReset },
  verification: { validate: validateVerification, create: createVerification }
};
