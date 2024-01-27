import Contact from "../models/contact.js";

async function listContacts() {
  const contacts = await Contact.find();
  console.log(contacts);
  return contacts;
}

async function getContactById(contactId) {
  const contactById = await Contact.findById(contactId);
  return contactById || null;
}

async function removeContact(contactId) {
  const contactById = await getContactById(contactId);
  await Contact.findByIdAndDelete(contactId);
  return contactById;
}

async function addContact(data) {
  const newContact = Contact.create(data);
  return newContact;
}

async function changeContact(contactId, data) {
  const changedContact = await Contact.findByIdAndUpdate(contactId, data, {
    new: true,
  });
  return changedContact || null;
}

async function updateStatusContact(contactId, data) {
  const changedContact = await Contact.findByIdAndUpdate(contactId, data, {
    new: true,
  });
  return changedContact || null;
}

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  changeContact,
  updateStatusContact,
};
