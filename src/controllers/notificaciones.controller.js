// src/controllers/notificaciones.controller.js
const pool = require('../db');

/**
 * RF-11: Ver recepción de notificaciones
 *
 * GET /notificaciones/:usuarioId
 *
 * Query opcional:
 *   ?soloNoLeidas=true   → solo notificaciones no leídas
 */
exports.listarNotificaciones = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { soloNoLeidas } = req.query;

    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Debe indicar usuarioId en la URL' });
    }

    // Construimos el SQL dinámicamente
    let sql = `
      SELECT id, usuario_id, titulo, mensaje, leida, creada_en
      FROM notificaciones
      WHERE usuario_id = $1
    `;
    const params = [usuarioId];

    if (soloNoLeidas === 'true') {
      sql += ' AND leida = FALSE';
    }

    sql += ' ORDER BY creada_en DESC';

    const result = await pool.query(sql, params);

    return res.json({
      total: result.rowCount,
      notificaciones: result.rows
    });
  } catch (error) {
    console.error('Error en listarNotificaciones:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};