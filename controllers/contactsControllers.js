import {
  createContactSchema,
  updateContactSchema,
} from "../schemas/contactsSchemas.js";
import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res) => {
  const allContacts = await contactsService.listContacts();
  res.status(200).json(allContacts);
};

export const getOneContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    const contact = await contactsService.getContactById(id);

    if (!contact) throw HttpError(404);

    res.status(201).json(contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    const contact = await contactsService.removeContact(id);

    if (!contact) throw HttpError(404);

    res.status(200).json(contact);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const newContact = req.body;

    const contactToAdd = await contactsService.addContact(
      newContact.name,
      newContact.email,
      newContact.phone
    );
    res.status(201).json(contactToAdd);
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    if (Object.keys(updates).length === 0)
      throw HttpError(400, "Body must have at least one field");

    const updatedContact = await contactsService.changeContact(id, updates);
    if (!updatedContact) throw HttpError(404);

    res.status(200).json(updatedContact);
  } catch (error) {
    next(error);
  }
};
