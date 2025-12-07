const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');

// RF-9: agregar producto al carrito
router.post('/agregar', carritoController.agregarProducto);

module.exports = router;