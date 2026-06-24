import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 4000,
    socketTimeout: 4000,
  });
  const mailOptions = {
    from: `"Library Management System" <${process.env.SMTP_EMAIL}>`,
    to: email,
    subject,
    html: message,
  };
  await transporter.sendMail(mailOptions);
};
