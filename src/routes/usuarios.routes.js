// src/routes/usuarios.routes.js
const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

// RF-8: registrar nuevo cliente
router.post('/', usuariosController.crearCliente);

// RF-7: actualizar idioma preferido del usuario
router.put('/:id/idioma', usuariosController.actualizarIdioma);

module.exports = router;
