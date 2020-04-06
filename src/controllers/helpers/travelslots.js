import db from "../../db";

const Travelslots = db.models.travelslots;

const getAvailableCities = async (req, res, next) => {
  const [to, from] = await Promise.all([
    Travelslots.find().distinct("toCity"),
    Travelslots.find().distinct("fromCity")
  ]);
  res.status(200).json({
    from: from,
    to: to
  });
};

export default {
  cities: getAvailableCities
};
