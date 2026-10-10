import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, text, html }) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `${process.env.FROM_NAME || "Auth Support"} <${process.env.FROM_EMAIL || "no-reply@auth.com"}>`,
      to,
      subject,
      text,
      html,
    });
  } else {
    console.log("\n=======================================================");
    console.log(`📧 [EMAIL SIMULATION] Sent To: ${to}`);
    console.log(`📌 Subject: ${subject}`);
    console.log(`🔗 Body:\n${text}`);
    console.log("=======================================================\n");
  }
};
