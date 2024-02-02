import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/user.js";
import HttpError from "../helpers/HttpError.js";

const { SECRET_KEY } = process.env;

export const registerUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailInUse = await User.findOne({ email });

    if (emailInUse) throw HttpError(409, "Email in use");

    const { password, ...otherUserData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      password: hashedPassword,
      ...otherUserData,
    });

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

export const loginUser = async (req, res, next) => {
  try {
    const { password, email } = req.body;

    const userEntering = await User.findOne({ email });

    if (!userEntering) throw HttpError(401, "Email or password is wrong");

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

export const logoutUser = async (req, res) => {
  try {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, { token: "" });
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};

export const refreshUser = async (req, res) => {
  try {
    const { email, subscription } = req.user;
    res.status(200).json({ email, subscription });
  } catch (error) {
    next(error);
  }
};

export const changeSubscription = async (req, res) => {
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