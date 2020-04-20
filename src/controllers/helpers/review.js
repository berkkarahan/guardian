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
      response.createdAt = rec.createdAt;
      response.canEdit = canUserEdit(rec, requestUser);
      // eslint-disable-next-line no-restricted-syntax
      for (const subDoc of subDocuments) {
        const subDocResponse = {};
        subDocResponse.content = rec[subDoc];
        subDocResponse.canLike = canLike(rec[subDoc], rec.user, requestUser);
        subDocResponse.canDislike = canDislike(
          rec[subDoc],
          rec.user,
          requestUser
        );
        response[subDoc] = subDocResponse;
      }
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
