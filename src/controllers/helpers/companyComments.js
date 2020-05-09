import db from "../../db";
import tryCatch from "../../utils/catcher";

const Company = db.models.company;
const User = db.models.user;

const compareUsers = (user1Id, user2Id) => {
  return String(user1Id) === String(user2Id);
};

const canUserEdit = (companyComment, user) => {
  // This is an auth optional route so if we don't get req.user
  // default response for canUserEdit is false.
  if (!user) {
    return false;
  }

  // MongoDB._id comparison in string.
  if (compareUsers(companyComment.user, user._id)) {
    return true;
  }
  return false;
};

const buildCompanyCommentsAllResponse = async (
  companyComments,
  requestUser
) => {
  const arrayResponse = await Promise.all(
    companyComments.map(async rec => {
      const response = {};
      const userResponse = {};
      response.uuid = rec.uuid;
      response.comment = rec.comment;
      response.canUserEdit = canUserEdit(rec, requestUser);
      const commentUser = await User.findById(rec.user);
      userResponse.userName = commentUser.userName;
      userResponse.firstName = commentUser.firstName;
      userResponse.lastName = commentUser.lastName;
      userResponse.email = commentUser.email;
      response.user = userResponse;
      return response;
    })
  );
  return arrayResponse;
};

export default {
  responseBuilders: { companyComment: { all: buildCompanyCommentsAllResponse } }
};
