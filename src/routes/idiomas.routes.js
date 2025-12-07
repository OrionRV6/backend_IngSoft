// src/routes/idiomas.routes.js
const express = require('express');
const router = express.Router();
const idiomasController = require('../controllers/idiomas.controller');

// RF-7: listar idiomas disponibles
router.get('/', idiomasController.listarIdiomas);

module.exports = router;
