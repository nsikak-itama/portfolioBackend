const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  }
});

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

// GET /api/portfolio - Get all portfolio data (public)
router.get('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();
    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not set up yet.' });
    }
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PROTECTED ADMIN ROUTES ───────────────────────────────────────────────────

// PUT /api/portfolio/hero - Update hero section
router.put('/hero', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' });

    Object.assign(portfolio.hero, req.body);
    await portfolio.save();
    res.json({ message: 'Hero section updated.', hero: portfolio.hero });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/portfolio/about - Update about section
router.put('/about', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' });

    Object.assign(portfolio.about, req.body);
    await portfolio.save();
    res.json({ message: 'About section updated.', about: portfolio.about });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/portfolio/contact - Update contact info
router.put('/contact', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not found.' });

    Object.assign(portfolio.contact, req.body);
    await portfolio.save();
    res.json({ message: 'Contact updated.', contact: portfolio.contact });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/portfolio/projects - Add a project
router.post('/projects', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    portfolio.projects.push(req.body);
    await portfolio.save();
    res.status(201).json({ message: 'Project added.', projects: portfolio.projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/portfolio/projects/:id - Update a project
router.put('/projects/:id', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    const project = portfolio.projects.id(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });

    Object.assign(project, req.body);
    await portfolio.save();
    res.json({ message: 'Project updated.', projects: portfolio.projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/portfolio/projects/:id - Delete a project
router.delete('/projects/:id', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    portfolio.projects = portfolio.projects.filter(p => p._id.toString() !== req.params.id);
    await portfolio.save();
    res.json({ message: 'Project deleted.', projects: portfolio.projects });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/portfolio/skills - Add a skill
router.post('/skills', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    portfolio.skills.push(req.body);
    await portfolio.save();
    res.status(201).json({ message: 'Skill added.', skills: portfolio.skills });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/portfolio/skills/:id - Delete a skill
router.delete('/skills/:id', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne();
    portfolio.skills = portfolio.skills.filter(s => s._id.toString() !== req.params.id);
    await portfolio.save();
    res.json({ message: 'Skill deleted.', skills: portfolio.skills });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/portfolio/upload-photo - Upload profile photo
router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const portfolio = await Portfolio.findOne();
    const photoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    portfolio.about.photo = photoUrl;
    await portfolio.save();

    res.json({ message: 'Photo uploaded.', photoUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

router.post('/upload-project-image', protect, upload.single('image'), async (req, res) => {
  try {
    if(!req.file) return res.status(400).json({message: 'No file uploaded'});
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({message: 'Image uploaded.', imageUrl});
  } catch (err){
    res.status(500).json({message: 'Server error.'});
  }
});

module.exports = router;