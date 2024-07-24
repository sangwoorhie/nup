import * as nodemailer from 'nodemailer';

export const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER || 'a26484638@gmail.com',
      pass: process.env.GMAIL_PASS || 'wyagnvhksfwbpihn',
    },
  });
};
