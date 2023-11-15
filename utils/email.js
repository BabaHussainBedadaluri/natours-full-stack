const nodemailer = require('nodemailer');
const { htmlToText } = require('html-to-text');
const Transport = require('nodemailer-brevo-transport');
const pug = require('pug');
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.USER_FROM;
  }
  newTranspoter() {
    if (process.env.NODE_ENV == 'production') {
      return nodemailer.createTransport({
        // service: 'Brevo',
        host: process.env.SENDINBLUE_HOST,
        port: process.env.SENDINBLUE_PORT,
        auth: {
          user: process.env.SENDINBLUE_LOGIN,
          pass: process.env.SENDINBLUE_PASSWORD,
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.USER_HOST,
      port: process.env.USER_PORT,
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
      },
      // Activate in Gmail "less secure app" option
    });
  }

  async send(template, subject) {
    // 1.Render HTML base on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        subject,
        url: this.url,
        firstName: this.firstName,
      }
    );
    // 2.Define Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      text: htmlToText(html),
      html,
    };
    // 3.create transport send mail
    await this.newTranspoter().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to natours family');
  }
  async resetPassword() {
    await this.send(
      'passwordReset',
      'Your password reset token ( valid only for 10 mins)'
    );
  }
};
