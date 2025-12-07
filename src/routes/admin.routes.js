// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// RF-14: Crear Producto
router.post('/productos', adminController.crearProducto);

// RF-15: Eliminar Producto
router.delete('/productos/:id', adminController.eliminarProducto);

// RF-16: Ver Proveedores
router.get('/proveedores', adminController.listarProveedores);

// RF-17: Ver Clientes
router.get('/clientes', adminController.listarClientes);

// RF-18: Ver Solicitudes de Soporte
router.get('/soporte', adminController.listarSoporte);

// RF-19: Gestionar Solicitud (cambiar estado/prioridad)
router.put('/soporte/:id', adminController.actualizarSoporte);

// RF-20: Ejecutar Mantenimiento
router.post('/mantenimiento', adminController.ejecutarMantenimiento);

module.exports = router;