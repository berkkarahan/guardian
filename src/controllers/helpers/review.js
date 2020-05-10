import db from "../../db";

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

const User = db.models.user;

const generateSubDocContent = subdoc => {
  const jsonSubdoc = JSON.parse(JSON.stringify(subdoc));
  delete jsonSubdoc._id;
  delete jsonSubdoc.userLikes;
  delete jsonSubdoc.userDislikes;
  return jsonSubdoc;
};

const compareUsers = (user1Id, user2Id) => {
  return String(user1Id) === String(user2Id);
};

const canUserEdit = (review, user) => {
  // This is an auth optional route so if we don't get req.user
  // default response for canUserEdit is false.
  if (!user) {
    return false;
  }

  // MongoDB._id comparison in string.
  if (compareUsers(review.user, user._id)) {
    return true;
  }
  return false;
};

const canLike = (subDoc, reviewUser, requestUser) => {
  // no unauthenticated requests
  if (!requestUser) {
    return false;
  }

  if (!subDoc.userLikes.includes(requestUser._id)) {
    return true;
  }
  return false;
};

const canDislike = (subDoc, reviewUser, requestUser) => {
  // no unauthenticated requests
  if (!requestUser) {
    return false;
  }

  if (!subDoc.userDislikes.includes(requestUser._id)) {
    return true;
  }
  return false;
};

const buildReviewAllResponse = async (reviews, requestUser) => {
  const arrayResponse = await Promise.all(
    reviews.map(async rec => {
      const response = {};

      // top-level response fields for review
      const reviewResponse = {};
      reviewResponse.uuid = rec.uuid;
      reviewResponse.averageRating = rec.averageRating;
      if (rec.showuser) {
        reviewResponse.details = rec.details;
      }
      reviewResponse.createdAt = rec.createdAt;
      reviewResponse.canEdit = canUserEdit(rec, requestUser);

      response.review = reviewResponse;

      // Sub-document response
      subDocuments.forEach(subDoc => {
        // build subdoc response only if it exists at review
        if (rec[subDoc]) {
          const subDocResponse = {};
          subDocResponse.content = generateSubDocContent(rec[subDoc]);
          // canDislike for subDoc
          if (rec[subDoc].userDislikes) {
            subDocResponse.canDislike = canDislike(
              rec[subDoc],
              rec.user,
              requestUser
            );
          } else {
            subDocResponse.canDislike = true;
          }
          // canLike for subDoc
          if (rec[subDoc].userLikes) {
            subDocResponse.canLike = canLike(
              rec[subDoc],
              rec.user,
              requestUser
            );
          } else {
            subDocResponse.canLike = true;
          }
          response[subDoc] = subDocResponse;
        }
      });

      // user fields for review response
      const reviewUser = await User.findById(rec.user);
      const userResponse = {};
      userResponse.userName = reviewUser.userName;
      userResponse.firstName = reviewUser.firstName;
      userResponse.lastName = reviewUser.lastName;
      userResponse.email = reviewUser.email;
      response.user = userResponse;

      return response;
    })
  );
  return arrayResponse;
};

export default {
  responseBuilders: { review: { all: buildReviewAllResponse } }
};
