import { nanoid } from "nanoid";
import fs from "fs/promises";
import path from "path";

const contactsPath = path.resolve("db", "contacts.json");

async function listContacts() {
  const buffer = await fs.readFile(contactsPath);
  const contacts = JSON.parse(buffer);
  return contacts;
}

async function getContactById(contactId) {
  const allContacts = await listContacts();
  const contactById = allContacts.find(({ id }) => id === contactId);
  return contactById || null;
}

async function removeContact(contactId) {
  const allContacts = await listContacts();
  const contactById = await getContactById(contactId);
  const updatedContacts = allContacts.filter(({ id }) => id !== contactId);
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
  return contactById;
}

async function addContact(name, email, phone) {
  const id = nanoid();
  const newContact = { id, name, email, phone };
  const allContacts = await listContacts();
  const updatedContacts = [...allContacts, newContact];
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
  return newContact;
}

async function changeContact(contactId, data) {
  const allContacts = await listContacts();
  const contactById = allContacts.find(({ id }) => id === contactId);
  if (!contactById) return null;

  const changedContact = {
    id: contactId,
    name: data.name || contactById.name,
    email: data.email || contactById.email,
    phone: data.phone || contactById.phone,
  };
  const updatedContacts = [
    ...allContacts.filter(({ id }) => id !== contactId),
    changedContact,
  ];
  await fs.writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2));
  return changedContact;
}

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  changeContact,
};
