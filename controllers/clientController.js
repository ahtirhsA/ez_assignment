const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const File = require('../models/file');
require('dotenv').config();

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, role: 'client' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const verificationLink = `${process.env.BASE_URL}/verify-email/${token}`;

    // Send verification email
    const transporter = nodemailer.createTransport({ service: 'Gmail', auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD } });
    await transporter.sendMail({ to: user.email, subject: 'Email Verification', text: `Verify your email: ${verificationLink}` });

    res.json({ message: 'Sign-up successful, verify your email' });
  } catch (err) {
    res.status(500).json({ message: 'Sign-up failed' });
  }
};

exports.listFiles = async (req, res) => {
  try {
    const files = await File.findAll();
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch files' });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findByPk(fileId);
    if (!file) return res.status(404).json({ message: 'File not found' });

    const encryptedUrl = crypto.createHmac('sha256', process.env.ENCRYPTION_SECRET).update(file.path).digest('hex');
    res.json({ 'download-link': `${process.env.BASE_URL}/download/${encryptedUrl}` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate download link' });
  }
};
