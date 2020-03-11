import db from "../src/db";

const User = db.models.user;

db.connect();

const mockUser = {
  userName: "testguy2",
  email: "testmail2@testy.com",
  password: "test"
};

const mockUser2 = {
  userName: "testguy3",
  email: "testmail3@testy.com",
  password: "test"
};

describe("MongoDB actions from mongoose", () => {
  it("find all users", async () => {
    const newUser = new User(mockUser);
    await newUser.save();
    const newUser2 = new User(mockUser2);
    await newUser2.save();
    console.log(await User.find({ email: /testmail/ }));
    console.log(typeof (await User.find({ email: /testmail/ })));
  });

  it("find one user", async () => {
    console.log(await User.findOne({ email: mockUser.email }));
    console.log(typeof (await User.findOne({ email: mockUser.email })));
  });
});
