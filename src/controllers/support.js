import mailer from "../utils/mailer";
import tryCatch from "../utils/catcher";

const sendContactUsMail = tryCatch(async (req, res, next) => {
  const { contactUs } = req.body;
  await mailer.support.prod(contactUs);
  res.status(200).send();
});

export default {
  send: sendContactUsMail
};
