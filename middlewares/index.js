const { validateBodyContacts } = require('./validateBodyContacts');
const { validateBody } = require('./validateBody');
const { isEmptyBody } = require('./isEmptyBody');
const { authenticate } = require('./authenticate');

module.exports = {
  validateBodyContacts,
  validateBody,
  isEmptyBody,
  authenticate,
};
