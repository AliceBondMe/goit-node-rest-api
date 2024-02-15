import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from "gravatar";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";
import path from "path";
import fs from "fs/promises";
import Jimp from "jimp";
import { nanoid } from "nanoid";
import sendEmail from "../helpers/sendEmail.js";

const { SECRET_KEY } = process.env;
const { BASE_URL } = process.env;

export const registerUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailInUse = await User.findOne({ email });

    if (emailInUse) throw HttpError(409, "Email in use");

    const { password, ...otherUserData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const avatarURL = gravatar.url(email);

    const verificationToken = nanoid();

    const newUser = await User.create({
      password: hashedPassword,
      ...otherUserData,
      avatarURL,
      verificationToken,
    });

    const verificationEmail = {
      to: [email],
      subject: "Verify your email",
      html: `<h1>Please follow the link below</h1><br/>
      <a target="blank" href="${BASE_URL}/api/users/verify/${verificationToken}" style="color:red; font-size: 28px">Click to verify email</a>
      `,
    };

    await sendEmail(verificationEmail);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;

    const user = await User.findOne({ verificationToken });

    if (!user) throw HttpError(404, "User not found");

    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });

    res.status(200).json({
      message: "Verification successful",
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerify = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) throw HttpError(404, "User not found");

    if (user.verify)
      throw HttpError(400, "Verification has already been passed");

    const verificationEmail = {
      to: [email],
      subject: "Verify your email",
      html: `<h1>Please follow the link below</h1><br/>
      <a target="blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}" style="color:red; font-size: 28px">Click to verify email</a>
      `,
    };

    await sendEmail(verificationEmail);

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    const userEntering = await User.findOne({ email });

    if (!userEntering) throw HttpError(401, "Email or password is wrong");
    if (!userEntering.verify) throw HttpError(401);

    const passwordIsValid = await bcrypt.compare(
      password,
      userEntering.password
    );

    if (!passwordIsValid) throw HttpError(401, "Email or password is wrong");

    const payload = { id: userEntering._id };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "8h" });

    const loggedUser = await User.findByIdAndUpdate(
      userEntering._id,
      { token: token },
      {
        new: true,
      }
    );

    res.status(200).json({
      token: loggedUser.token,
      user: {
        email: loggedUser.email,
        subscription: loggedUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

export const refreshUser = async (req, res, next) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
};

export const changeSubscription = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { subscription } = req.body;
    await User.findByIdAndUpdate(_id, { subscription: subscription });

    res
      .status(200)
      .json({ subscription, message: "Subscription successfully changed" });
  } catch (error) {
    next(error);
  }
};

export const changeAvatar = async (req, res, next) => {
  try {
    const { _id } = req.user;

    if (!req.file) throw HttpError(400, "Avatar file is required");

    const { path: tempUpload, originalname } = req.file;
    const newFilename = `${_id}_${originalname}`;
    const resultUpload = path.resolve("public", "avatars", newFilename);

    // Resize avatar to 250x250 using jimp
    const avatar = await Jimp.read(tempUpload);
    avatar.cover(250, 250).write(resultUpload);

    // Remove the temporary uploaded file
    await fs.unlink(tempUpload);

    await User.findByIdAndUpdate(_id, { avatarURL: resultUpload });

    res.status(200).json({ avatarURL: resultUpload });
  } catch (error) {
    next(error);
  }
};
