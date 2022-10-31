const nodemailer = require('nodemailer');

var transporter = null;
export const initNewsletterService = () => {
    transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
       });   
}

export const sendNewsletterEmail = (emailFrom, emailTo, subject, text, callback) => {
    let mailOptions = {
        from: emailFrom,
        to: emailTo,
        subject,
        text,
       };
       
    transporter.sendMail(mailOptions, callback);
}

export const verifyNewsletterService = () => {
    transporter.verify((err, success) => {
        err
          ? console.log(err)
          : console.log(`=== Server is ready to take messages: ${success} ===`);
       });
}

