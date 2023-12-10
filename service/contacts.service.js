const Contacts = require('./schemas/contacts');

const getAll = async (owner, page, limit, favorite) => {
  const skip = (page - 1) * limit;
  const findParams = (favorite === undefined) ? { owner } : { owner, favorite };
  return Contacts.find(findParams, null, { skip, limit }).populate('owner', 'name email');
};

const getContactById = async (contactId, owner) => {
  return Contacts.findOne({ _id: contactId, owner });
};

const addContact = async body => {
  return Contacts.create({ ...body });
};

const updateContact = async (contactId, body, owner) => {
  return Contacts.findOneAndUpdate({ _id: contactId, owner }, body, { new: true });
};

const removeContact = async (contactId, owner) => {
  return Contacts.findOneAndDelete({ _id: contactId, owner });
};

const updateFavorite = async (contactId, favorite, owner) => {
  return Contacts.findOneAndUpdate({ _id: contactId, owner }, { favorite }, { new: true });
};

module.exports = {
  getAll,
  getContactById,
  addContact,
  updateContact,
  removeContact,
  updateFavorite,
};