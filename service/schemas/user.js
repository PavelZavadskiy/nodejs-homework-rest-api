const { Schema, model } = require('mongoose');
const Joi = require('joi');

const { handleSaveError, preUpdate } = require('./hooks');

const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const userSchema = new Schema({
  email: {
    type: String,
    match: emailRegex,
    unique: true,
    required: [true, 'Set email'],
  },
  password: {
    type: String,
    minLength: 6,

    required: [true, 'Set password'],
  },
  avatarURL: {
    type: String,
  },
  subscription: {
    type: String,
    enum: ["starter", "pro", "business"],
    default: "starter"
  },
  token: {
    type: String,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
    required: [true, 'Verify token is required'],
  },
}, { versionKey: false, timestamps: true });

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", preUpdate);

userSchema.post("findOneAndUpdate", handleSaveError);

const userSignupSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
})

const userSigninSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
  password: Joi.string().min(6).required(),
})

const userEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
})

const Users = model('users', userSchema);

module.exports = {
  Users,
  userSignupSchema,
  userSigninSchema,
  userEmailSchema,
};
