const jwt = require('jsonwebtoken');
const { HttpError, CtrlWrapper } = require('../helpers');
const { Users } = require('../service/schemas/user.js');
require('dotenv').config();

const { JWT_SECRET } = process.env;

const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) throw HttpError(401, 'Not authorized');
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer') {
    // return next(HttpError(401));
    throw HttpError(401, 'Not authorized');
  }

  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await Users.findById(id);
    if (!user || !user.token || user.token !== token) throw HttpError(401, 'Not authorized');
    req.user = user;
    next();
  } catch (error) {
    throw HttpError(401, error.message);
  }
};

module.exports = {
  authenticate: CtrlWrapper(authenticate),
}
