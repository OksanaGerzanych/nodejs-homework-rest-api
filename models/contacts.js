const fs = require("fs/promises");
const path = require("path");
//const { nanoid } = require('nanoid');

const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  return JSON.parse(data);
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contactById = contacts.find((contact) => contact.id === contactId);
  return contactById || null;
};

// const removeContact = async (contactId) => {}

// const addContact = async (body) => {}

// const updateContact = async (contactId, body) => {}

module.exports = {
  listContacts,
  getContactById,
  //removeContact,
  //addContact,
  //updateContact,
};
