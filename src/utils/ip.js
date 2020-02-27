import ip6addr from "ip6addr";

const getIpInfo = req => {
  const xForwardedFor = (req.headers["x-forwarded-for"] || "").replace(
    /:\d+$/,
    ""
  );
  const addr = ip6addr.parse(xForwardedFor || req.connection.remoteAddress);
  let ipv4 = "empty";
  try {
    ipv4 = addr.toString({ format: "v4" });
  } catch (error) {
    ipv4 = "127.0.0.1";
  }
  return ipv4;
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
