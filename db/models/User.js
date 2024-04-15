const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  profilePicture: String,
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    index: { unique: true },
    require: true,
  },
  profilePicture: {
    type: String,
    default: null
  },
  password: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

UserSchema.methods.verifyPassword = async function verifyPassword(password) {
  try {
    const res = await bcrypt.compare(password, this.password);
    return res;
  } catch (err) {
    return err;
  }
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
