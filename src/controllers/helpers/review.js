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

const canUserEdit = (review, user) => {
  if (review.user === user) {
    return true;
  }
  return false;
};

const canLike = (subDoc, reviewUser, requestUser) => {
  if (reviewUser !== requestUser && !subDoc.userLikes.includes(requestUser)) {
    return true;
  }
  return false;
};

const canDislike = (subDoc, reviewUser, requestUser) => {
  if (
    reviewUser !== requestUser &&
    !subDoc.userDislikes.includes(requestUser)
  ) {
    return true;
  }
  return false;
};

const buildReviewAllResponse = async (reviews, requestUser) => {
  const arrayResponse = await Promise.all(
    reviews.map(async rec => {
      const response = {};

      // top-level response fields for review
      if (rec.showuser) {
        response.details = rec.details;
      }
      response.createdAt = rec.createdAt;
      response.canEdit = canUserEdit(rec, requestUser);

      // Sub-document response
      subDocuments.forEach(subDoc => {
        // build subdoc response only if it exists at review
        if (rec[subDoc]) {
          const subDocResponse = {};
          subDocResponse.content = rec[subDoc];
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
