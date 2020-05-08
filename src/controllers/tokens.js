import db from "../db";
import tryCatch from "../utils/catcher";
import config from "../envvars";
import mailer from "../utils/mailer";

const Token = db.models.token;
const User = db.models.user;

// served over a GET request
const validateVerification = tryCatch(async (req, res, next) => {
  const tokenUUID = req.query.uuid;
  const token = await Token.findOne({ token_uuid: tokenUUID });

  if (!token) {
    return res.status(403).json({ message: "Token not found" });
  }

  const verificationResult = await token.verifyUser();
  if (!verificationResult) {
    return res.status(403).json({ message: "Verification failed." });
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
  const { password, uuid } = req.body;
  const token = await Token.findOne({ token_uuid: uuid });
  if (!token) {
    return res.status(403).json({ message: "Token not found." });
  }

  const passwordResetResult = await token.resetPassword(password);
  if (!passwordResetResult) {
    return res.status(403).json({ message: "Invalid token." });
  }
  // remove token once we are done changing password
  await token.remove();
  res.status(200).send();
});

const createPasswordReset = tryCatch(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res
      .status(403)
      .json({ message: `User with email not found: ${email}` });
  }
  const pwdResetToken = new Token();
  await pwdResetToken.generatePasswordResetToken(user);
  // send email to pwd reset page with token uuid as url parameter
  const resetUrl = `${config.fe_url}/forgot_password.html?uuid=${pwdResetToken.token_uuid}`;
  await mailer.passwordReset.prod(resetUrl, email);
  res.status(200).json({ token_uuid: pwdResetToken.uuid });
});

export default {
  password: { validate: validatePasswordReset, create: createPasswordReset },
  verification: { validate: validateVerification, create: createVerification }
};
