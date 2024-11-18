const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const File = require('../models/file');
require('dotenv').config();

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
                          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']; // xlsx
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only pptx, docx, and xlsx files are allowed'));
    }
    cb(null, true);
  },
});

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email, role: 'ops' } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.uploadFile = [upload.single('file'), async (req, res) => {
  try {
    const file = await File.create({
      name: req.file.originalname,
      path: req.file.path,
      uploadedBy: req.user.id,
    });
    res.json({ message: 'File uploaded successfully', file });
  } catch (err) {
    res.status(500).json({ message: 'File upload failed' });
  }
}];
