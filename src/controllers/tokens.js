import db from "../db";
import tryCatch from "../utils/catcher";

const Token = db.models.token;
const User = db.models.user;

// served over a GET request
const validateVerification = tryCatch(async (req, res, next) => {
  const tokenUUID = req.query.uuid;
  const token = await Token.findOne({ token_uuid: tokenUUID });

  if (!token) {
    await res.status(403).json({ message: "Token not found" });
  }

  const verificationResult = await token.verifyUser();
  if (!verificationResult) {
    await res.status(403).json({ message: "Verification failed." });
  }
  await token.remove();
  res.status(201).json({ message: "Verification successful." });
});

// POST request, requires local authorization with passport
const createVerification = tryCatch(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const token = new Token();
  await token.generateVerificationToken(user);
  res.status(201).json(token);
});

// served over a POST request.
const validatePasswordReset = tryCatch(async (req, res, next) => {
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
});

// POST request, send 200 regarldess of user found or not
const createPasswordReset = tryCatch(async (req, res, next) => {
  const { user } = req.body;
  const dbUser = await User.findOne({ email: user.email });
  if (dbUser) {
    const token = new Token();
    await token.generatePasswordResetToken(dbUser);
  }
  // implement email sending logic here
  res.status(200).send();
});

export default {
  password: { validate: validatePasswordReset, create: createPasswordReset },
  verification: { validate: validateVerification, create: createVerification }
};
