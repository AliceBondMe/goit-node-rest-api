import HttpError from "../helpers/HttpError.js";
import checkId from "../helpers/checkId.js";
import Contact from "../models/contact.js";

export const getAllContacts = async (req, res) => {
  try {
    const { page = 1, limit = 5, favorite } = req.query;
    const { _id: owner } = req.user;
    const skip = (page - 1) * limit;

    let query = { owner };

    if (favorite !== undefined) {
      query.favorite = favorite === "true";
    }

    const totalContacts = await Contact.countDocuments(query);

    const contacts = await Contact.find(query, "-createdAt -updatedAt", {
      skip,
      limit,
    }).populate("owner", "email");
    res.status(200).json({
      total: totalContacts,
      perPage: limit,
      currentPage: page,
      contacts: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    checkId(id);

    const { _id: owner } = req.user;

    const contact = await Contact.findById(id).where("owner").equals(owner);

    if (!contact) throw HttpError(404);

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    checkId(id);

    const { _id: owner } = req.user;

    const contact = await Contact.findByIdAndDelete(id)
      .where("owner")
      .equals(owner);

    if (!contact) {
      throw HttpError(404);
    }

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { _id: owner } = req.user;
    const contactToAdd = await Contact.create({ ...req.body, owner });
    res.status(201).json(contactToAdd);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    checkId(id);

    const { _id: owner } = req.user;

    if (Object.keys(updates).length === 0)
      throw HttpError(400, "Body must have at least one field");

    const updatedContact = await Contact.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .where("owner")
      .equals(owner);

    if (!updatedContact) throw HttpError(404);

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};

export const updateFavoriteContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const { _id: owner } = req.user;

    const updatedContact = await Contact.findByIdAndUpdate(id, updates, {
      new: true,
    })
      .where("owner")
      .equals(owner);

    if (!updatedContact) throw HttpError(404);

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
