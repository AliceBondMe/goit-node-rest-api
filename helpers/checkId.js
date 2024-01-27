import { Types } from "mongoose";
import HttpError from "./HttpError.js";

const checkId = () => {
  const func = (req, _, next) => {
    const id = req.params.id;
    const isIdValid = Types.ObjectId.isValid(id);

    if (!isIdValid) {
      throw HttpError(400, "Contact doesn`t exist");
    }

    next();
  };

  return func;
};

export default checkId;
