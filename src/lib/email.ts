import nodemailer from "nodemailer";
import { getDatabase } from "./mongodb";

export const ADMIN_EMAILS = [
  "info@futuremilestone.shop",
  "support@futuremilestone.shop",
];

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  orderId?: string;
}

export async function sendEmail({ to, subject, html, orderId }: SendEmailParams) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || "no-reply@futuremilestone.shop";

  const recipientString = Array.isArray(to) ? to.join(", ") : to;

  let success = false;
  let errorMsg: string | null = null;

  console.log("\n=================== SENDING EMAIL (CLIENT) ===================");
  console.log(`To:      ${recipientString}`);
  console.log(`Subject: ${subject}`);
  console.log(`Order ID: ${orderId || "N/A"}`);
  console.log("------------------- HTML CONTENT -------------------");
  console.log(html);
  console.log("====================================================\n");

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: smtpFrom,
        to: recipientString,
        subject,
        html,
      });

      console.log(`Email successfully sent via SMTP to ${recipientString}: ${info.messageId}`);
      success = true;
    } catch (err: any) {
      console.error("SMTP Email transmission failed:", err);
      errorMsg = err.message || String(err);
    }
  } else {
    console.log("SMTP not configured in env. Email simulation logged to console.");
    success = true;
  }

  // Persist email logs in db
  try {
    const db = await getDatabase();
    await db.collection("sent_emails").insertOne({
      to: recipientString,
      subject,
      html,
      orderId,
      sentAt: new Date(),
      success,
      error: errorMsg,
      smtpUsed: !!(smtpHost && smtpUser && smtpPass),
    });
  } catch (dbErr) {
    console.error("Failed to log sent email to database:", dbErr);
  }

  return { success, error: errorMsg };
}
