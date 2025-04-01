const express = require('express');
const signatureController = require('../controllers/signatureController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all routes after this middleware
router.use(authMiddleware.protect);

router.post('/:id/request', signatureController.requestSignature);
router.get('/:id/verify', signatureController.verifySignature);
router.post('/callback', signatureController.signatureCallback);

module.exports = router;