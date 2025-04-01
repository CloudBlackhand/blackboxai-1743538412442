const express = require('express');
const documentsController = require('../controllers/documentsController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.route('/')
  .get(documentsController.getAllDocuments)
  .post(documentsController.createDocument);

router.route('/:id')
  .get(documentsController.getDocument);

router.route('/:id/pdf')
  .get(documentsController.generateDocumentPdf);

module.exports = router;