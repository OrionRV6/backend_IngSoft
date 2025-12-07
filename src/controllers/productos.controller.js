// src/controllers/productos.controller.js
const pool = require('../db');

/**
 * RF-4: Visualizar catálogo de productos
 * 
 * Endpoint: GET /productos
 * 
 * Filtros opcionales por querystring:
 *  - ?buscar=texto        → busca por nombre (LIKE)
 *  - ?categoria=Electrónica
 *  - ?precioMin=10000
 *  - ?precioMax=50000
 */
exports.listarProductos = async (req, res) => {
  try {
    const { buscar, categoria, precioMin, precioMax } = req.query;

    // Armamos la consulta dinámicamente
    let sql = `
      SELECT id, nombre, descripcion, imagen_url, precio, stock, categoria
      FROM productos
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Filtro por texto en nombre
    if (buscar) {
      sql += ` AND nombre ILIKE $${paramIndex}`;
      params.push(`%${buscar}%`);
      paramIndex++;
    }

    // Filtro por categoría
    if (categoria) {
      sql += ` AND categoria = $${paramIndex}`;
      params.push(categoria);
      paramIndex++;
    }

    // Filtro por precio mínimo
    if (precioMin) {
      sql += ` AND precio >= $${paramIndex}`;
      params.push(Number(precioMin));
      paramIndex++;
    }

    // Filtro por precio máximo
    if (precioMax) {
      sql += ` AND precio <= $${paramIndex}`;
      params.push(Number(precioMax));
      paramIndex++;
    }

    // Orden por nombre (puedes cambiarlo si quieres)
    sql += ' ORDER BY nombre ASC';

    const result = await pool.query(sql, params);

    return res.json({
      total: result.rowCount,
      productos: result.rows
    });

  } catch (error) {
    console.error('Error en listarProductos:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};