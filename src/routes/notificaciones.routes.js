// src/routes/notificaciones.routes.js
const express = require('express');
const router = express.Router();
const notificacionesController = require('../controllers/notificaciones.controller');

// RF-11: ver notificaciones de un usuario
// Ej: GET /notificaciones/2        → todas
//     GET /notificaciones/2?soloNoLeidas=true
router.get('/:usuarioId', notificacionesController.listarNotificaciones);

module.exports = router;
