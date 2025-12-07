// src/controllers/redes.controller.js
const pool = require('../db');

/**
 * RF-5: Visualizar redes sociales de la tienda
 * 
 * Endpoint: GET /redes-sociales
 * 
 * Devuelve la lista de redes sociales configuradas:
 *  - nombre
 *  - url
 *  - icono (clase CSS o nombre de icono)
 */
exports.listarRedesSociales = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, url, icono
      FROM redes_sociales
      ORDER BY id ASC
    `;

    const result = await pool.query(query);

    return res.json({
      total: result.rowCount,
      redes: result.rows
    });

  } catch (error) {
    console.error('Error en listarRedesSociales:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};