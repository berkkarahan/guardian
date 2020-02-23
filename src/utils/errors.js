/* eslint-disable max-classes-per-file */
class UserAlreadyDeactivated extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class MongooseConnection extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export default {
  UserAlreadyDeactivated,
  MongooseConnection
};
