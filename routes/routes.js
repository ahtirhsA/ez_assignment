const express = require('express');
const opsController = require('../controllers/opsController');
const clientController = require('../controllers/clientController');
const authenticate = require('../middleware/authMiddleware');
const router = express.Router();

// Ops User routes
router.post('/ops/login', opsController.login);
router.post('/ops/upload', authenticate, opsController.uploadFile);

// Client User routes
router.post('/signup', clientController.signup);
router.get('/files', authenticate, clientController.listFiles);
router.get('/download/:fileId', authenticate, clientController.downloadFile);

module.exports = router;
