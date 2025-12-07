// src/routes/redes.routes.js
const express = require('express');
const router = express.Router();
const redesController = require('../controllers/redes.controller');

// RF-5: Obtener redes sociales de la tienda
router.get('/', redesController.listarRedesSociales);

module.exports = router;