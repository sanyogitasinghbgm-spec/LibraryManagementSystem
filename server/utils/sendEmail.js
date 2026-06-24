import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
  // ── BREVO API INTEGRATION ──
  if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) {
    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: "Library Management System",
            email: process.env.BREVO_SENDER_EMAIL,
          },
          to: [
            {
              email: email,
            },
          ],
          subject: subject,
          htmlContent: message,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Brevo API error");
      }
      console.log("Email sent successfully via Brevo API");
      return;
    } catch (err) {
      console.error("Brevo API failed:", err.message);
      // Fallback to SMTP if Brevo fails
    }
  }

  // ── SMTP FALLBACK ──
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
