import nodemailer from "nodemailer";
import config from "../envvars";

const mailTransport = nodemailer.createTransport({
  service: "gmail",
  secure: false,
  port: 25,
  auth: {
    user: config.sender_email,
    pass: config.sender_pwd
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendVerification = async (verifUrl, toMail) => {
  const mailInfo = {
    from: config.sender_email,
    to: toMail,
    cc: "berkkarahan00@gmail.com",
    subject: `Rate'N'Ride Verification Email: ${toMail}`,
    text: verifUrl
  };

  // send the mail
  await mailTransport.sendMail(mailInfo);
};

const sendVerificationTest = async verifUrl => {
  await sendVerification(verifUrl, config.sender_email);
};

export default {
  verification: { prod: sendVerification, test: sendVerificationTest }
};
