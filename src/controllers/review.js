import db from "../db";
import tryCatch from "../utils/catcher";

const Review = db.models.review;
const Company = db.models.company;
const Travelslots = db.models.travelslots;

const reviewReadMany = tryCatch(async (req, res, next) => {
  const { companyUUID, travelslotUUID } = req.body.review;
  const [company, travelslot] = await Promise.all([
    Company.findOne({ uuid: companyUUID }),
    Travelslots.findOne({ uuid: travelslotUUID })
  ]);
  const reviews = await Review.find({
    company: company,
    travelslot: travelslot
  });
  // TODO: Filtering & response builder.
  res.status(200).json(reviews);
});

const createReview = tryCatch(async (req, res, next) => {
  const {
    driver,
    hostess,
    breaks,
    travel,
    baggage,
    pet,
    comfort,
    vehicle,
    travelslotUUID,
    companyUUID,
    details,
    showuser
  } = req.body.review;
  const subDocuments = {
    driver,
    hostess,
    breaks,
    travel,
    baggage,
    pet,
    comfort,
    vehicle
  };

  const [company, travelslot] = await Promise.all([
    Company.findOne({ uuid: companyUUID }),
    Travelslots.findOne({ uuid: travelslotUUID })
  ]);

  if (!travelslot && !company) {
    res.status(403).json({
      error: "A review must have both a travelslot and company attached to it."
    });
  }
  const review = new Review();
  Object.entries(subDocuments).forEach(async pairs => {
    const [docName, docObj] = pairs;
    // Minimal payload for sub-review should consist of;
    // comment and rating
    if (docObj) {
      if (!docObj.comment && !docObj.rating) {
        return res.status(403).json({
          error:
            "Minimal payload for a subreview must include comment and rating."
        });
      }
      delete docObj.likes;
      delete docObj.dislikes;
      review[docName] = docObj;
    }
  });
  // set model ref fields
  review.user = req.user;
  review.travelslot = travelslot;
  review.company = company;

  if (showuser) {
    review.showuser = true;
  } else {
    review.showuser = false;
  }

  if (details) {
    review.details = details;
  }

  await review.save();
  res.status(201).json({
    data: {
      reviewUUID: review.uuid
    }
  });
});

const subDocParamCheck = async (req, res, next) => {
  const subDocuments = [
    "driver",
    "hostess",
    "breaks",
    "travel",
    "baggage",
    "pet",
    "comfort",
    "vehicle"
  ];
  const { subdoc } = req.params;
  if (subDocuments.includes(subdoc)) {
    next();
  }
  res.status(403).json({
    message: "/api/review/:subdoc/... subdoc parameter is entered wrong.",
    validSubDocuments: subDocuments
  });
};

const updateLikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }
  const review = Review.findOne({ uuid: uuid });
  review[subdoc].likes += 1;
  await review.save();
  res.status(200).send();
});

const updateDislikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }
  const review = Review.findOne({ uuid: uuid });
  review[subdoc].dislikes += 1;
  await review.save();
  res.status(200).send();
});

const updateReview = tryCatch(async (req, res, next) => {
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = await Review.findOne({ uuid: uuid });

  const {
    driver,
    hostess,
    breaks,
    travel,
    baggage,
    pet,
    comfort,
    vehicle,
    details,
    showuser
  } = req.body.review;
  const subDocuments = {
    driver,
    hostess,
    breaks,
    travel,
    baggage,
    pet,
    comfort,
    vehicle
  };

  Object.entries(subDocuments).forEach(async pairs => {
    const [docName, docObj] = pairs;
    // Minimal payload for sub-review should consist of;
    // comment and rating
    if (docObj) {
      if (!docObj.comment && !docObj.rating) {
        return res.status(403).json({
          error:
            "Minimal payload for a subreview must include comment and rating"
        });
      }
      delete docObj.likes;
      delete docObj.dislikes;
      review[docName] = docObj;
    }
  });

  if (showuser) {
    review.showuser = true;
  } else {
    review.showuser = false;
  }

  if (details) {
    review.details = details;
  }

  await review.save();
  res.status(200).json({
    data: {
      reviewUUID: review.uuid
    }
  });
});

const updateSubDocument = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }
  const updatedSubdoc = req.body.review[subdoc];
  const review = await Review.findOne({ uuid: uuid });
  review[subdoc].comment = updatedSubdoc.comment;
  review[subdoc].rating = updatedSubdoc.rating;
  await review.save();
  res.status(200).send();
});

const deleteSubDocument = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for delete operation." });
  }
  const review = await Review.findOne({ uuid: uuid });
  delete review[subdoc];
  await review.save();
  res.status(200).send();
});

const deleteReview = tryCatch(async (req, res, next) => {
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }
  await Review.findOneAndDelete({ uuid: uuid });
  res.status(200).send();
});

export default {
  readMany: reviewReadMany,
  create: createReview,
  update: {
    review: updateReview,
    likes: updateLikes,
    dislikes: updateDislikes,
    subdoc: updateSubDocument
  },
  delete: { review: deleteReview, subdoc: deleteSubDocument },
  parameterChecker: subDocParamCheck
};
