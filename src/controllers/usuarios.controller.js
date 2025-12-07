// src/controllers/usuarios.controller.js
const pool = require('../db');

/**
 * RF-8: Registrar nuevo cliente
 * 
 * POST /clientes   (también /usuarios con el mismo controller)
 * 
 * Body:
 * {
 *   "nombre": "Juan Pérez",
 *   "correo": "juan@correo.cl",
 *   "contrasena": "juan123",
 *   "direccion": "Calle X 123",
 *   "idioma_preferido": "es-CL"   // opcional
 * }
 */
exports.crearCliente = async (req, res) => {
  try {
    const { nombre, correo, contrasena, direccion, idioma_preferido } = req.body;

    // 1) Validar campos obligatorios
    if (!nombre || !correo || !contrasena || !direccion) {
      return res.status(400).json({
        mensaje: 'Debe enviar nombre, correo, contrasena y direccion'
      });
    }

    // 2) Verificar que el correo no exista ya
    const existe = await pool.query(
      `SELECT id FROM usuarios WHERE correo = $1`,
      [correo]
    );

    if (existe.rowCount > 0) {
      return res.status(409).json({
        mensaje: 'El correo ya está registrado'
      });
    }

    // 3) Insertar nuevo usuario con rol CLIENTE
    const insertQuery = `
      INSERT INTO usuarios (nombre, correo, contraseña_hash, direccion, rol, idioma_preferido)
      VALUES ($1, $2, $3, $4, 'CLIENTE', $5)
      RETURNING id, nombre, correo, direccion, rol, idioma_preferido
    `;

    const values = [
      nombre,
      correo,
      contrasena,               // en un sistema real iría el hash
      direccion,
      idioma_preferido || 'es-CL'
    ];

    const result = await pool.query(insertQuery, values);

    return res.status(201).json({
      mensaje: 'Cliente registrado correctamente',
      cliente: result.rows[0]
    });

  } catch (error) {
    console.error('Error en crearCliente:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * RF-7: Seleccionar / actualizar idioma preferido del usuario
 * 
 * PUT /usuarios/:id/idioma
 * 
 * Body:
 * {
 *   "codigoIdioma": "es-CL"
 * }
 */
exports.actualizarIdioma = async (req, res) => {
  try {
    const { id } = req.params;
    const { codigoIdioma } = req.body;

    if (!codigoIdioma) {
      return res.status(400).json({
        mensaje: 'Debe enviar codigoIdioma'
      });
    }

    // Verificar que el idioma exista
    const idiomaResult = await pool.query(
      `SELECT codigo, nombre FROM idiomas WHERE codigo = $1`,
      [codigoIdioma]
    );

    if (idiomaResult.rowCount === 0) {
      return res.status(400).json({
        mensaje: 'El código de idioma no es válido'
      });
    }

    // Verificar que el usuario exista
    const usuarioResult = await pool.query(
      `SELECT id, nombre, correo FROM usuarios WHERE id = $1`,
      [id]
    );

    if (usuarioResult.rowCount === 0) {
      return res.status(404).json({
        mensaje: 'Usuario no encontrado'
      });
    }

    // Actualizar idioma_preferido
    const updateResult = await pool.query(
      `UPDATE usuarios
       SET idioma_preferido = $1
       WHERE id = $2
       RETURNING id, nombre, correo, idioma_preferido`,
      [codigoIdioma, id]
    );

    return res.json({
      mensaje: 'Idioma actualizado correctamente',
      usuario: updateResult.rows[0]
    });

  } catch (error) {
    console.error('Error en actualizarIdioma:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};