const { Users } = require('../service/schemas/user.js');
const { HttpError, CtrlWrapper } = require('../helpers');
const bcrytp = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs').promises;
const path = require('path');
const Jimp = require("jimp");
const { nanoid } = require('nanoid');
const { sendMail } = require('../helpers/sendEmail.js');
require('dotenv').config();

const signUp = async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });
  if (user)
    throw HttpError(409, 'Email in use');

  const password = await bcrytp.hash(req.body.password, 10);
  const avatarURL = gravatar.url(req.body.email);
  const verificationToken = nanoid();

  sendMail(req.body.email, "Verificate email", `<a target="_blank" href="${process.env.BASE_URL}:${process.env.PORT}/users/verify/${verificationToken}">Click verify email</a>`);
  const newUser = await Users.create({ ...req.body, password, avatarURL, verificationToken });

  res.status(201).json({ name: newUser.name, email: newUser.email, avatarURL: newUser.avatarURL });
};

const signIn = async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });
  if (!user)
    throw HttpError(401, 'User not found');

  if (!user.verify) {
    throw HttpError(401, 'Email not verify');
  }

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

  const avatar = path.join('avatars', filename);

  const { avatarURL } = await Users.findByIdAndUpdate(_id, { avatarURL: avatar });

  res.json({ avatarURL });
};

const resendVerify = async (req, res, next) => {
  const { email } = req.body;
  const user = await Users.findOne({ email });
  if (!user) {
    throw HttpError(404, 'Not Found');
  }
  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }

  sendMail(req.body.email, "Verificate email", `<a target="_blank" href="${process.env.BASE_URL}:${process.env.PORT}/users/verify/${user.verificationToken}">Click verify email</a>`);

  res.json({ message: "Verification email sent" });
}

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;
  const user = await Users.findOne({ verificationToken });
  if (!user) {
    throw HttpError(404, 'Not Found');
  }
  await Users.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });
  res.json({ message: "Verification successful" });
}

module.exports = {
  signUp: CtrlWrapper(signUp),
  signIn: CtrlWrapper(signIn),
  getCurrent: CtrlWrapper(getCurrent),
  signOut: CtrlWrapper(signOut),
  updateSubscription: CtrlWrapper(updateSubscription),
  updateAvatar: CtrlWrapper(updateAvatar),
  verify: CtrlWrapper(verify),
  resendVerify: CtrlWrapper(resendVerify),
};
