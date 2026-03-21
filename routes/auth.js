const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
// Only works if NO user exists yet (single-user lock)
router.post('/register', async (req, res) => {
  try {
    const existingUser = await User.findOne();

    if (existingUser) {
      return res.status(403).json({
        message: 'Registration is closed. This portfolio already has an owner.'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const user = await User.create({ email, password });

    // Auto-create default portfolio data for this user
    const portfolio = new Portfolio({
      hero: {
        greeting: "Hi, I'm",
        name: 'Abbas H Abubakar',
        roles: ['Software Engineer', 'Web Developer', 'Front-End Engineer'],
        tagline: 'I build fast, scalable, and user-focused web experiences that help businesses turn ideas into digital products people love to use.',
      },
      about: {
        name: 'Abbas H Abubakar',
        title: 'Software Engineer | Web Developer | Front-End Engineer',
        bio: "Hi, I'm Abbas Abubakar, a passionate Software Engineer & Frontend Developer. I specialize in building modern, responsive, and user-focused web applications that help businesses bring their ideas to life.",
        bio2: "When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.",
        photo: '',
        resumeUrl: '',
      },
      contact: {
        email: 'nsikak.itama@gmail.com',
        linkedinUrl: 'https://linkedin.com',
        githubUrl: 'https://github.com',
        whatsappUrl: 'https://wa.me/1234567890',
      },
      projects: [],
      skills: [
        { name: 'React', category: 'Frontend', icon: 'react' },
        { name: 'JavaScript', category: 'Frontend', icon: 'javascript' },
        { name: 'TypeScript', category: 'Frontend', icon: 'typescript' },
        { name: 'HTML5', category: 'Frontend', icon: 'html5' },
        { name: 'CSS3', category: 'Frontend', icon: 'css3' },
        { name: 'Node.js', category: 'Backend', icon: 'nodejs' },
        { name: 'MongoDB', category: 'Backend', icon: 'mongodb' },
        { name: 'Express.js', category: 'Backend', icon: 'express' },
        { name: 'Python', category: 'Backend', icon: 'python' },
      ]
    });

    await portfolio.save();

    res.status(201).json({
      token: generateToken(user._id),
      user: { email: user.email, id: user._id }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    res.json({
      token: generateToken(user._id),
      user: { email: user.email, id: user._id }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// GET /api/auth/status - Check if a user exists (for frontend to know if setup is needed)
router.get('/status', async (req, res) => {
  try {
    const userExists = await User.findOne();
    res.json({ hasOwner: !!userExists });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;