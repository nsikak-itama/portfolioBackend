const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  tags: [String],
  liveUrl: String,
  githubUrl: String,
  featured: { type: Boolean, default: false }
});

const skillSchema = new mongoose.Schema({
  name: String,
  icon: String,      // URL or class name
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Tools', 'Other'],
    default: 'Frontend'
  }
});

const portfolioSchema = new mongoose.Schema({
  // Hero Section
  hero: {
    greeting: { type: String, default: "Hi, I'm" },
    name: { type: String, default: 'Abbas H Abubakar' },
    roles: [{ type: String }], // ["Software Engineer", "Web Developer", "Front-End Engineer"]
    tagline: { type: String, default: 'I build fast, scalable, and user-focused web experiences.' },
  },

  // About Section
  about: {
    name: { type: String, default: 'Abbas H Abubakar' },
    title: { type: String, default: 'Software Engineer | Web Developer | Front-End Engineer' },
    bio: { type: String, default: '' },
    bio2: { type: String, default: '' },
    photo: { type: String, default: '' }, // URL
    resumeUrl: { type: String, default: '' },
  },

  // Contact Info
  contact: {
    email: { type: String, default: 'nsikak.itama@gmail.com' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    whatsappUrl: { type: String, default: '' },
  },

  // Projects
  projects: [projectSchema],

  // Skills
  skills: [skillSchema],

  // Meta
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update timestamp
portfolioSchema.pre('save', function() {
  this.updatedAt = new Date();
});

module.exports = mongoose.model('Portfolio', portfolioSchema);