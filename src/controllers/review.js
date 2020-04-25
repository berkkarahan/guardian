import db from "../db";
import tryCatch from "../utils/catcher";
import reviewHelpers from "./helpers/review";

const Review = db.models.review;
const Company = db.models.company;
const Travelslots = db.models.travelslots;

const reviewReadMany = tryCatch(async (req, res, next) => {
  const { companyUUID, travelslotUUID } = req.body.review;
  if (!companyUUID && !travelslotUUID) {
    return res.status(403).json({
      error:
        "At least either company or travelslot is necessary to filter reviews."
    });
  }

  const reviews = Review.find();

  if (companyUUID) {
    const company = await Company.findOne({ uuid: companyUUID });
    reviews.where("company").equals(company);
  }

  if (travelslotUUID) {
    const travelslot = await Travelslots.findOne({ uuid: travelslotUUID });
    reviews.where("travelslot").equals(travelslot);
  }

  const finalReviews = await reviews.exec();
  const arrayResponse = await reviewHelpers.responseBuilders.review.all(
    finalReviews,
    req.user
  );
  res.status(200).json(arrayResponse);
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
      delete docObj.userLikes;
      delete docObj.userDislikes;
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
    return next();
  }
  res.status(403).json({
    message: "/api/review/:subdoc/... subdoc parameter is entered wrong.",
    enteredSubDoc: subdoc,
    validSubDocuments: subDocuments
  });
};

const countLikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = Review.findOne({ uuid: uuid });
  res.status(200).json({ count: review[subdoc].likes });
});

const countDislikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = Review.findOne({ uuid: uuid });
  res.status(200).json({ count: review[subdoc].dislikes });
});

const increaseLikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = Review.findOne({ uuid: uuid });

  if (
    review[subdoc].userLikes.includes(req.user._id) ||
    review[subdoc].userDislikes.includes(req.user._id)
  ) {
    return res
      .status(403)
      .json({ error: "User already liked or disliked this review" });
  }

  review[subdoc].likes += 1;
  review[subdoc].userLikes.push(req.user._id);

  await review.save();
  res.status(200).json({
    data: {
      reviewUUID: review.uuid,
      user: req.user,
      canLike: false,
      likes: review.likes
    }
  });
});

const increaseDislikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = Review.findOne({ uuid: uuid });

  if (
    review[subdoc].userLikes.includes(req.user._id) ||
    review[subdoc].userDislikes.includes(req.user._id)
  ) {
    return res
      .status(403)
      .json({ error: "User already liked or disliked this review" });
  }

  review[subdoc].dislikes += 1;
  review[subdoc].userDislikes.push(req.user._id);

  await review.save();
  res.status(200).json({
    data: {
      reviewUUID: review.uuid,
      user: req.user,
      canDislike: false,
      dislikes: review.dislikes
    }
  });
});

const decreaseLikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = Review.findOne({ uuid: uuid });
  if (!review[subdoc].userLikes.includes(req.user._id)) {
    return res
      .status(403)
      .json({ error: "User doesn't have a like for this subcomment." });
  }

  review[subdoc].likes -= 1;
  review[subdoc].userLikes.pull(req.user._id);

  await review.save();
  res.status(200).json({
    data: {
      reviewUUID: review.uuid,
      user: req.user,
      canLike: true,
      likes: review.likes
    }
  });
});

const decreaseDislikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = Review.findOne({ uuid: uuid });
  if (!review[subdoc].userLikes.includes(req.user._id)) {
    return res
      .status(403)
      .json({ error: "User doesn't have a dislike for this subcomment." });
  }

  review[subdoc].dislikes -= 1;
  review[subdoc].userDislikes.pull(req.user._id);

  await review.save();
  res.status(200).json({
    data: {
      reviewUUID: review.uuid,
      user: req.user,
      canDislike: true,
      dislikes: review.dislikes
    }
  });
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
      delete docObj.userLikes;
      delete docObj.userDislikes;
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
  const { uuid, comment, rating } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = await Review.findOne({ uuid: uuid });

  if (comment) {
    review[subdoc].comment = comment;
  }

  if (rating) {
    review[subdoc].rating = rating;
  }

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
  await review[subdoc].remove();
  await review.save();
  res.status(200).json({ review: review });
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
    likes: { increase: increaseLikes, decrease: decreaseLikes },
    dislikes: { increase: increaseDislikes, decrease: decreaseDislikes },
    subdoc: updateSubDocument
  },
  delete: { review: deleteReview, subdoc: deleteSubDocument },
  count: { likes: countLikes, dislikes: countDislikes },
  parameterChecker: subDocParamCheck
};
