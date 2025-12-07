// src/routes/resenas.routes.js
const express = require('express');
const router = express.Router();
const resenasController = require('../controllers/resenas.controller');

// RF-13: Crear una nueva reseña
router.post('/', resenasController.crearResena);

// Extra: Ver las reseñas de un producto
router.get('/:productoId', resenasController.listarResenasProducto);

module.exports = router;