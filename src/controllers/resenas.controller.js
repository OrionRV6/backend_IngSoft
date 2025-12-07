// src/controllers/resenas.controller.js
const pool = require('../db');

/**
 * RF-13: Ingresa reseñas o valoraciones de los productos
 */
exports.crearResena = async (req, res) => {
  try {
    const { usuario_id, producto_id, puntuacion, comentario } = req.body;

    // 1. Validaciones básicas
    if (!usuario_id || !producto_id || !puntuacion) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    if (puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ mensaje: 'La puntuación debe ser entre 1 y 5' });
    }

    if (comentario && comentario.length > 200) {
      return res.status(400).json({ mensaje: 'El comentario excede 200 caracteres' });
    }

    // 2. VERIFICACIÓN: ¿El usuario compró el producto?
    // Nota: En la tabla 'ordenes' el campo es 'cliente_id'
    const verificacionCompra = await pool.query(
      `SELECT o.id 
       FROM ordenes o
       JOIN orden_items oi ON o.id = oi.orden_id
       WHERE o.cliente_id = $1 
         AND oi.producto_id = $2
         AND o.estado IN ('PAGADA', 'ENVIADO', 'ENTREGADO', 'ENTREGADO') 
       LIMIT 1`,
      [usuario_id, producto_id]
    );

    if (verificacionCompra.rowCount === 0) {
      return res.status(403).json({ 
        mensaje: 'No puedes valorar este producto. No tienes una compra confirmada del mismo.' 
      });
    }

    // 3. Insertar la reseña
    // CORRECCIÓN: La tabla en SQL usa 'cliente_id', no 'usuario_id'
    const insertQuery = `
      INSERT INTO resenas (cliente_id, producto_id, puntuacion, comentario)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [usuario_id, producto_id, puntuacion, comentario]);

    return res.status(201).json({
      mensaje: 'Valoración registrada exitosamente',
      resena: result.rows[0]
    });

  } catch (error) {
    console.error('Error en crearResena:', error); // Mira tu terminal para ver el error exacto de SQL
    if (error.code === '23505') { 
      return res.status(400).json({ mensaje: 'Ya has valorado este producto anteriormente.' });
    }
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

exports.listarResenasProducto = async (req, res) => {
  try {
    const { productoId } = req.params;
    // CORRECCIÓN: Join con cliente_id
    const result = await pool.query(
      `SELECT r.puntuacion, r.comentario, r.creado_en as fecha, u.nombre as usuario
       FROM resenas r
       JOIN usuarios u ON r.cliente_id = u.id
       WHERE r.producto_id = $1
       ORDER BY r.creado_en DESC`,
      [productoId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener reseñas' });
  }
};