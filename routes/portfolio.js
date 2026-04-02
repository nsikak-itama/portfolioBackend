const express = require('express');
const router = express.Router();
const multer = require('multer');
const Portfolio = require('../models/Portfolio');
const { protect } = require('../middleware/auth');
const cloudinary = require('../cloudinary');

const upload = multer({ storage: multer.memoryStorage() });

// ─── PUBLIC ROUTES ───────────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne();
    if (!portfolio) return res.status(404).json({ message: 'Portfolio not set up yet.' });
    res.json(portfolio);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
});

// ─── PROTECTED ADMIN ROUTES ──────────────────────────────────────────────────

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

// Upload helper - converts buffer to Cloudinary URL
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'portfolio' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(buffer);
  });
};

router.post('/upload-photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const url = await uploadToCloudinary(req.file.buffer);
    const portfolio = await Portfolio.findOne();
    portfolio.about.photo = url;
    await portfolio.save();
    res.json({ message: 'Photo uploaded.', photoUrl: url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed.' });
  }
});

router.post('/upload-project-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
    const url = await uploadToCloudinary(req.file.buffer);
    res.json({ message: 'Image uploaded.', imageUrl: url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed.' });
  }
});

module.exports = router;