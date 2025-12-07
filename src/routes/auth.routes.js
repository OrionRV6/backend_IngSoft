const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// RF-1: Login
router.post('/login', authController.login);

// RF-2: Recuperación de contraseña
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// RF-3: Cierre de sesión (logout)
router.post('/logout', authController.logout);

module.exports = router;