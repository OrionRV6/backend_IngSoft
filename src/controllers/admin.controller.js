// src/controllers/admin.controller.js
const pool = require('../db');

// =================================================
// RF-14: Ingresar nuevos productos
// =================================================
exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoria, imagen_url, audio_url } = req.body;

    // Validación básica
    if (precio < 0 || stock < 0) {
      return res.status(400).json({ mensaje: 'El precio y stock deben ser positivos' });
    }

    const query = `
      INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen_url, audio_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, precio, stock, categoria, imagen_url, audio_url]);

    res.status(201).json({ mensaje: 'Producto creado exitosamente', producto: result.rows[0] });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') {
       return res.status(400).json({ mensaje: 'Ya existe un producto con ese nombre' });
    }
    res.status(500).json({ mensaje: 'Error al crear producto' });
  }
};

// =================================================
// RF-15: Eliminar productos
// =================================================
exports.eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Restricción: No eliminar si tiene ventas asociadas
    const checkVentas = await pool.query('SELECT id FROM orden_items WHERE producto_id = $1 LIMIT 1', [id]);
    
    if (checkVentas.rowCount > 0) {
      return res.status(400).json({ 
        mensaje: 'No se puede eliminar: El producto tiene ventas o pedidos asociados.' 
      });
    }

    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
        return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error interno al eliminar producto' });
  }
};

// =================================================
// RF-16: Visualizar proveedores
// =================================================
exports.listarProveedores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM proveedores ORDER BY nombre ASC');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener proveedores' });
  }
};

// =================================================
// RF-17: Visualizar Clientes (Vista Admin)
// =================================================
exports.listarClientes = async (req, res) => {
  try {
    // Filtramos solo los que tienen rol CLIENTE
    const query = `
      SELECT id, nombre, correo, direccion, estado_cuenta, creado_en 
      FROM usuarios 
      WHERE rol = 'CLIENTE'
      ORDER BY nombre ASC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
};

// =================================================
// RF-18: Listado solicitudes de soporte
// =================================================
exports.listarSoporte = async (req, res) => {
  try {
    // Unimos con usuarios para ver quién creó el ticket
    const query = `
      SELECT s.*, u.nombre as nombre_cliente, u.correo as correo_cliente
      FROM solicitudes_soporte s
      JOIN usuarios u ON s.cliente_id = u.id
      ORDER BY 
        CASE s.prioridad WHEN 'ALTA' THEN 1 WHEN 'MEDIA' THEN 2 ELSE 3 END,
        s.creado_en DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener tickets de soporte' });
  }
};

// =================================================
// RF-19: Gestión de solicitud (Responder/Estado)
// =================================================
exports.actualizarSoporte = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, prioridad, respuesta } = req.body; 
    // Nota: 'respuesta' se recibe para simular el email, aunque no se guarde si no hay columna en BD.

    const query = `
      UPDATE solicitudes_soporte 
      SET estado = $1, prioridad = $2, actualizado_en = NOW(), correo_enviado = TRUE
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [estado, prioridad, id]);

    if (result.rowCount === 0) return res.status(404).json({ mensaje: 'Solicitud no encontrada' });

    // Simulación de envío de correo
    console.log(`[EMAIL] Enviando respuesta al cliente sobre solicitud #${id}: "${respuesta || 'Estado actualizado'}"`);

    res.json({ 
      mensaje: 'Solicitud actualizada y cliente notificado', 
      solicitud: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al gestionar soporte' });
  }
};

// =================================================
// RF-20: Optimización (Mantenimiento)
// =================================================
exports.ejecutarMantenimiento = async (req, res) => {
  try {
    const { usuario_id, descripcion } = req.body; 

    // Simulamos la tarea técnica
    console.log(">> Iniciando proceso de mantenimiento...");
    console.log(">> Limpiando archivos temporales...");
    console.log(">> Reindexando base de datos...");

    const descFinal = descripcion || 'Optimización General del Sistema';

    const query = `
      INSERT INTO tareas_mantenimiento (usuario_id, descripcion, resultado)
      VALUES ($1, $2, 'Exitoso: Sistema optimizado y caché liberada')
      RETURNING *
    `;
    
    const result = await pool.query(query, [usuario_id, descFinal]);

    res.json({ 
      mensaje: 'Mantenimiento ejecutado correctamente', 
      detalle: result.rows[0] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al ejecutar mantenimiento' });
  }
};