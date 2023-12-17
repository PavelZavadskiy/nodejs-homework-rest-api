const { Users } = require('../service/schemas/user.js');
const { HttpError, CtrlWrapper } = require('../helpers');
const bcrytp = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signUp = async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user)
    throw HttpError(409, 'Email in use');

  const password = await bcrytp.hash(req.body.password, 10);

  const newUser = await Users.create({ ...req.body, password });
  res.status(201).json({ name: newUser.name, email: newUser.email });
};

const signIn = async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user)
    throw HttpError(401, 'User not found');

  const passwordCompare = await bcrytp.compare(req.body.password, user.password);
  if (!passwordCompare)
    throw HttpError(401, 'Email or password is wrong');

  const payload = { id: user.id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "23h" })
  await Users.findByIdAndUpdate(user.id, { token });

  res.json({ token });
};

const getCurrent = async (req, res, next) => {
  const { subscription, email } = req.user;
  res.json({ email, subscription });
};

const signOut = async (req, res, next) => {
  const { _id } = req.user;
  await Users.findByIdAndUpdate(_id, { token: '' });
  res.status(204).json({ message: 'No Content' });
};

const updateSubscription = async (req, res, next) => {
  const { _id } = req.user;
  const { email, subscription } = await Users.findByIdAndUpdate(_id, { subscription: req.query.subscription });
  res.json({ email, subscription });
};

module.exports = {
  signUp: CtrlWrapper(signUp),
  signIn: CtrlWrapper(signIn),
  getCurrent: CtrlWrapper(getCurrent),
  signOut: CtrlWrapper(signOut),
  updateSubscription: CtrlWrapper(updateSubscription),
};
