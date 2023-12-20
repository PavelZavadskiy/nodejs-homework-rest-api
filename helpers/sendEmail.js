const nodemailer = require('nodemailer');
require('dotenv').config();


const nodemailerConfig = {
  host: "smtp.ukr.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.MAIL_PASS,
  }
};

const transport = nodemailer.createTransport(nodemailerConfig);

const sendMail = (emailTo, subject, message) => {
  const email = {
    from: process.env.EMAIL_FROM,
    to: emailTo,
    subject,
    html: message,
  }

  transport.sendMail(email)
    .then(() => console.log('Email send success'))
    .catch(error => console.log('Email send error >> ', error));
}

module.exports = { sendMail };




