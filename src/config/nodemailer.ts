import nodemailer from 'nodemailer';
import path from 'path';
import hbs from 'handlebars';
import fs from 'fs';

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const compileTemplate = (templateName: string, data: any) => {
  const filePath = path.join(__dirname, `../templates/${templateName}.hbs`);
  const template = fs.readFileSync(filePath, 'utf-8');
  return hbs.compile(template)(data);
};