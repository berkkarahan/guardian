const getIpInfo = req => {
  const xForwardedFor = (req.headers["x-forwarded-for"] || "").replace(
    /:\d+$/,
    ""
  );
  const ip = xForwardedFor || req.connection.remoteAddress;
  return ip;
};

const getIpInfoMiddleware = async (req, res, next) => {
  const ip = getIpInfo(req);
  req.IPAdress = ip;
  next();
};

export default {
  fn: getIpInfo,
  middleware: getIpInfoMiddleware
};
