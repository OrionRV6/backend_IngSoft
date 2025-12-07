// src/controllers/paginas.controller.js
const pool = require('../db');

/**
 * RF-6: Listar páginas complementarias
 * 
 * GET /paginas
 * 
 * Devuelve todas las páginas (quienes somos, contacto, FAQ, etc.)
 */
exports.listarPaginas = async (req, res) => {
  try {
    const query = `
      SELECT id, slug, titulo, contenido, orden
      FROM paginas
      ORDER BY orden ASC, id ASC
    `;

    const result = await pool.query(query);

    return res.json({
      total: result.rowCount,
      paginas: result.rows
    });
  } catch (error) {
    console.error('Error en listarPaginas:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * RF-6: Obtener una página por slug
 * 
 * GET /paginas/:slug
 * 
 * Ejemplo:
 *  - /paginas/quienes-somos
 *  - /paginas/contacto
 */
exports.obtenerPaginaPorSlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const query = `
      SELECT id, slug, titulo, contenido, orden
      FROM paginas
      WHERE slug = $1
    `;
    const result = await pool.query(query, [slug]);

    if (result.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Página no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en obtenerPaginaPorSlug:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};