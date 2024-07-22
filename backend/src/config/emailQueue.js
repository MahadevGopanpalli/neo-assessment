const EventEmitter = require('events');
const { sendEmail } = require('./emailUtil'); // Import the email module

class EmailQueue extends EventEmitter {}

const emailQueue = new EmailQueue();

emailQueue.on('sendEmail', async (emailData) => {
  try {
    await sendEmail(emailData.to, emailData.subject, emailData.htmlContent);
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Failed to send email:', err);
  }
});

module.exports = emailQueue;
