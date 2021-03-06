/* eslint-disable no-restricted-syntax */
import db from "../db";
import tryCatch from "../utils/catcher";
import reviewHelpers from "./helpers/review";
import paginationUtils from "../utils/filters/utils";
import reviewFilters from "../utils/filters/review";

const Review = db.models.review;
const Company = db.models.company;
const Travelslots = db.models.travelslots;

const reviewReadMany = tryCatch(async (req, res, next) => {
  // req.body.filters is a must now
  const filterParameters = paginationUtils.parseParameters(req.body);
  const { companyUUID, travelslotUUID } = filterParameters.query;
  if (!companyUUID && !travelslotUUID) {
    return res.status(403).json({
      error:
        "At least either company or travelslot is necessary to filter reviews."
    });
  }

  const company = await Company.findOne({ uuid: companyUUID });
  const travelslot = await Travelslots.findOne({ uuid: travelslotUUID });

  const companyID = company ? company._id : undefined;
  const travelslotID = travelslot ? travelslot._id : undefined;

  const queryObject = reviewFilters.query(
    Review.find(),
    companyID,
    travelslotID
  );

  const paginatedQuery = await paginationUtils.paginateQuery(
    queryObject,
    5,
    filterParameters.pageNumber
  );
  const arrayResponse = await reviewHelpers.responseBuilders.review.all(
    await paginatedQuery.paginatedResponse.exec(),
    req.user
  );
  const modifiedHeaders = paginationUtils.setHeaders(paginatedQuery, res);
  modifiedHeaders.status(200).json(arrayResponse);
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
    return res.status(403).json({
      error: "A review must have both a travelslot and company attached to it."
    });
  }
  const review = new Review();

  for (const [docName, docObj] of Object.entries(subDocuments)) {
    if (docObj) {
      // Minimal payload for sub-review should consist of;
      // comment and rating
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
  }

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

const likeSubReview = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = await Review.findOne({ uuid: uuid });

  // if user already liked, return
  if (review[subdoc].userLikes.includes(req.user._id)) {
    return res.status(304).json({ message: "User already liked this post." });
  }

  // check if user previously disliked
  if (review[subdoc].userDislikes.includes(req.user._id)) {
    review[subdoc].dislikes -= 1;
    review[subdoc].userDislikes.pull(req.user._id);
  }

  review[subdoc].likes += 1;
  review[subdoc].userLikes.push(req.user._id);
  await review.save();
  res.status(200).json({
    review: {
      uuid: uuid,
      subDocument: review[subdoc],
      canDislike: true,
      canLike: false
    }
  });
});

const dislikeSubReview = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = await Review.findOne({ uuid: uuid });

  // if user already disliked, return
  if (review[subdoc].userDislikes.includes(req.user._id)) {
    return res
      .status(304)
      .json({ message: "User already disliked this post." });
  }

  // check if user previously liked
  if (review[subdoc].userLikes.includes(req.user._id)) {
    review[subdoc].likes -= 1;
    review[subdoc].userLikes.pull(req.user._id);
  }

  review[subdoc].dislikes += 1;
  review[subdoc].userDislikes.push(req.user._id);
  await review.save();
  res.status(200).json({
    review: {
      uuid: uuid,
      subDocument: review[subdoc],
      canDislike: false,
      canLike: true
    }
  });
});

const increaseLikes = tryCatch(async (req, res, next) => {
  const { subdoc } = req.params;
  const { uuid } = req.body.review;
  if (!uuid) {
    return res
      .status(403)
      .json({ error: "Review uuid is required for update operation." });
  }

  const review = await Review.findOne({ uuid: uuid });

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

  const review = await Review.findOne({ uuid: uuid });

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

  const review = await Review.findOne({ uuid: uuid });
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

  const review = await Review.findOne({ uuid: uuid });
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

  for (const [docName, docObj] of Object.entries(subDocuments)) {
    if (docObj) {
      // Minimal payload for sub-review should consist of;
      // comment and rating
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
  }

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
    like: likeSubReview,
    likes: { increase: increaseLikes, decrease: decreaseLikes },
    dislike: dislikeSubReview,
    dislikes: { increase: increaseDislikes, decrease: decreaseDislikes },
    subdoc: updateSubDocument
  },
  delete: { review: deleteReview, subdoc: deleteSubDocument },
  count: { likes: countLikes, dislikes: countDislikes },
  parameterChecker: subDocParamCheck
};
