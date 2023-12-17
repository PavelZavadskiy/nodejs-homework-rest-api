const { Users } = require('../service/schemas/user.js');
const { HttpError, CtrlWrapper } = require('../helpers');
const bcrytp = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require("jimp");

const signUp = async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user)
    throw HttpError(409, 'Email in use');

  const password = await bcrytp.hash(req.body.password, 10);
  const avatarURL = gravatar.url(req.body.email);
  const newUser = await Users.create({ ...req.body, password, avatarURL });

  res.status(201).json({ name: newUser.name, email: newUser.email, avatarURL: newUser.avatarURL });
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

const updateAvatar = async (req, res, next) => {
  const { _id } = req.user;
  const { path: oldPath, filename } = req.file;

  await Jimp.read(oldPath)
    .then((lenna) => {
      return lenna
        .resize(250, 250) // resize
        .write(oldPath); // save
    })
    .catch((err) => {
      throw HttpError(500, err.message);
    });

  const newPath = path.resolve('public', 'avatars', filename);
  await fs.rename(oldPath, newPath);
  const { avatarURL } = await Users.findByIdAndUpdate(_id, { avatarURL: newPath });

  res.json({ avatarURL });
};

module.exports = {
  signUp: CtrlWrapper(signUp),
  signIn: CtrlWrapper(signIn),
  getCurrent: CtrlWrapper(getCurrent),
  signOut: CtrlWrapper(signOut),
  updateSubscription: CtrlWrapper(updateSubscription),
  updateAvatar: CtrlWrapper(updateAvatar),
};
