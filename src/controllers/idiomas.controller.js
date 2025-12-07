// src/controllers/idiomas.controller.js
const pool = require('../db');

/**
 * RF-7 (parte 1): Listar idiomas disponibles
 * 
 * GET /idiomas
 */
exports.listarIdiomas = async (req, res) => {
  try {
    const query = `
      SELECT codigo, nombre
      FROM idiomas
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);

    return res.json({
      total: result.rowCount,
      idiomas: result.rows
    });
  } catch (error) {
    console.error('Error en listarIdiomas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
