const nodemailer = require('nodemailer');
const env = require('../config/env');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: env.BREVO_SMTP_HOST,
    port: env.BREVO_SMTP_PORT,
    auth: {
      user: env.BREVO_SMTP_USER,
      pass: env.BREVO_SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `Cuddle Hearts <${env.BREVO_FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
    attachments: options.attachments,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
