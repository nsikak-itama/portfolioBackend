const express = require('express');
const router = express.Router();

// POST /api/contact - Handle contact form submissions
// You can add nodemailer here later to receive emails
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    // Log the message (in production, send via email using nodemailer)
    console.log('📬 New Contact Message:');
    console.log(`  From: ${name} <${email}>`);
    console.log(`  Subject: ${subject || 'No subject'}`);
    console.log(`  Message: ${message}`);

    // TODO: Add nodemailer here to forward to your email
    // const transporter = nodemailer.createTransporter({ ... });
    // await transporter.sendMail({ ... });

    res.json({ message: 'Message received! I\'ll get back to you soon.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

module.exports = router;