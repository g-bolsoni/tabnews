import nodemailer from "nodemailer";
import orchestrator from "../tests/orchestrator";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  secure: process.env.NODE_ENV === "production",
});

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

const sendEmail = async (mailOptions: MailOptions): Promise<void> => {
  await orchestrator.clearAllMails();
  await transporter.sendMail(mailOptions);
};

const mail = {
  sendMail: sendEmail,
};

export default mail;
