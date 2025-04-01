const authController = require('../controllers/authController');

module.exports = {
  protect: authController.protect,
  restrictTo: authController.restrictTo
};