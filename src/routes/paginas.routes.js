// src/routes/paginas.routes.js
const express = require('express');
const router = express.Router();
const paginasController = require('../controllers/paginas.controller');

// RF-6: listar todas las páginas complementarias
router.get('/', paginasController.listarPaginas);

// RF-6: obtener una página específica por slug
router.get('/:slug', paginasController.obtenerPaginaPorSlug);

module.exports = router;