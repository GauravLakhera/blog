const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "../public/images/user.png",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, pass) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("user not foune :(");
    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac("sha256", salt)
      .update(pass)
      .digest("hex");
    if (hashedPassword !== userProvidedHash)
      throw new Error("incorrect password ");
    const token = createTokenForUser(user);
    return token;
  }
);

//this code will run before the data is going to save (pre)
//in this code we are hashing the password and saving the salt and hashedPasswrod to the database
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;
  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  this.salt = salt;
  this.password = hashedPassword;
  next();
});

const User = model("usre", userSchema);

module.exports = User;
