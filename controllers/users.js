const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const path = require("path");
const Jimp = require("jimp");
const fs = require("fs/promises");
const { nanoid } = require("nanoid");
const { User, schemas } = require("../models/user");
const { HttpError, sendEmail } = require("../helpers");
const { SECRET_KEY, PROJECT_URL } = process.env;

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

const register = async (req, res, next) => {
  try {
    const { error } = schemas.registerSchema.validate(req.body);
    if (error) {
      throw HttpError(400, (message = "Invalid field value"));
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email already in use");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);
    const verificationToken = nanoid();

    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verification successful",
      html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${verificationToken}" >Click to verify email</a>`,
    };
    await sendEmail(verifyEmail);
    res.status(201).json({
      email: newUser.email,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { error } = schemas.loginSchema.validate(req.body);
    if (error) {
      throw HttpError(400, (message = "Invalid field value"));
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !user.verify) {
      throw HttpError(401, "Email or password wrong");
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password invalid");
    }

    const payload = {
      id: user._id,
    };
    console.log(payload);
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "6d" });
    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      token,
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.json({
      email,
      subscription,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });

    res.json({
      message: "Logout success",
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const filename = `${_id}_${originalname}`;

    const resultUpload = path.join(avatarsDir, filename);

    const image = await Jimp.read(tempUpload);
    image.resize(250, 250).write(resultUpload);

    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL });
    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ verificationToken });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    await User.findByIdAndUpdate(user._id, { verify: true, verifyToken: "" });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerifyEmail = async (req, res, next) => {
  try {
    const { error } = schemas.emailSchema.validate(req.body);
    if (error) {
      throw HttpError(400, "Invalid field value");
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(404, "Not found user");
    }
    if (user.verify) {
      throw HttpError(400, "Verification has already been passed");
    }
    const verifyEmail = {
      to: email,
      subject: "Verification successful",
      html: `<a target="_blank" href="${PROJECT_URL}/api/users/verify/${user.verificationToken}" >Click to verify email</a>`,
    };
    await sendEmail(verifyEmail);
    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateAvatar,
  verify,
  resendVerifyEmail,
};
