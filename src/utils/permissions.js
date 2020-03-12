const isAdmin = async function(req, res, next) {
  if (req.user.is_admin) {
    return next();
  }
  res.status(403).send();
};

export default {
  isadmin: isAdmin
};
