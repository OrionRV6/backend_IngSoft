// src/routes/ordenes.routes.js
const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenes.controller');

// RF-10: incorporar proceso de pago (crear orden desde el carrito)
router.post('/', ordenesController.crearOrden);

// RF-12: visualizar seguimiento de compra (detalle de una orden)
router.get('/seguimiento/:ordenId', ordenesController.verSeguimientoOrden);

module.exports = router;