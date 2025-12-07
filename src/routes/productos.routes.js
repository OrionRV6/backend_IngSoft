// src/routes/productos.routes.js
const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productos.controller');

// RF-4: Listar catálogo de productos (con filtros opcionales)
router.get('/', productosController.listarProductos);

module.exports = router;