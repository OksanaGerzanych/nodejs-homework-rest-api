const bcrypt = require("bcrypt");
const { User, schemas } = require("../models/user");
const { HttpError } = require("../helpers");

const register = async (req, res, next) => {
  try {
    // const { error } = schemas.registerSchema.validate(req.body);
    // if (error) {
    //   throw HttpError(400, (message = "Invalid field value"));
    // }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email already in use");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    res.status(201).json({
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
};
