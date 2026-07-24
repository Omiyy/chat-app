const { Worker } = require('bullmq');
const nodemailer = require('nodemailer');
const { connection } = require('./emailQueue');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emailWorker = new Worker('emailQueue', async job => {
  const { to, subject, html } = job.data;
  
  await transporter.sendMail({
    from: '"Chat App" <noreply@chatapp.com>',
    to,
    subject,
    html
  });
  
  console.log(`[Worker] Sent email to ${to}`);
}, {
  connection,
  settings: {
    backoffStrategies: {
      exponential: function(attemptsMade, err) {
        return Math.round((Math.pow(2, attemptsMade) - 1) * 1000);
      }
    }
  }
});

emailWorker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed: ${err.message}`);
});

module.exports = emailWorker;
