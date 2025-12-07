// src/controllers/ordenes.controller.js
const pool = require('../db');

/**
 * RF-10: Incorporar proceso de pago
 *
 * POST /ordenes
 *
 * Body:
 * {
 *   "usuario_id": 2,
 *   "medio_pago": "DEBITO",
 *   "direccion_entrega": "Calle X 123, Talca"
 * }
 */
exports.crearOrden = async (req, res) => {
  const client = await pool.connect();

  try {
    const { usuario_id, medio_pago, direccion_entrega } = req.body;

    // 1) Validar datos de entrada
    if (!usuario_id || !medio_pago || !direccion_entrega) {
      return res.status(400).json({
        mensaje: 'Debe enviar usuario_id, medio_pago y direccion_entrega'
      });
    }

    // 2) Validar medio de pago
    const mediosPermitidos = ['DEBITO', 'CREDITO', 'EFECTIVO', 'TRANSFERENCIA'];
    if (!mediosPermitidos.includes(medio_pago)) {
      return res.status(400).json({
        mensaje: 'Medio de pago no válido',
        medios_permitidos: mediosPermitidos
      });
    }

    // 3) Verificar que el usuario exista
    const usuario = await client.query(
      'SELECT id, nombre FROM usuarios WHERE id = $1',
      [usuario_id]
    );

    if (usuario.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // 4) Obtener el carrito del usuario (en la BD se llama cliente_id)
    const carritoRes = await client.query(
      'SELECT id FROM carritos WHERE cliente_id = $1',
      [usuario_id]
    );

    if (carritoRes.rowCount === 0) {
      return res.status(400).json({ mensaje: 'El usuario no tiene carrito activo' });
    }

    const carrito_id = carritoRes.rows[0].id;

    // 5) Obtener los items del carrito con datos de producto
    const itemsRes = await client.query(
      `
      SELECT ci.id AS carrito_item_id,
             ci.producto_id,
             ci.cantidad,
             p.nombre,
             p.precio,
             p.stock
      FROM carrito_items ci
      JOIN productos p ON ci.producto_id = p.id
      WHERE ci.carrito_id = $1
      `,
      [carrito_id]
    );

    if (itemsRes.rowCount === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }

    const items = itemsRes.rows;

    // 6) Verificar stock y calcular total
    let total = 0;

    for (const item of items) {
      if (item.stock < item.cantidad) {
        return res.status(400).json({
          mensaje: `Stock insuficiente para el producto "${item.nombre}"`
        });
      }
      total += Number(item.precio) * item.cantidad;
    }

    // 7) Iniciar transacción
    await client.query('BEGIN');

    // 8) Insertar la orden (ojo: la columna es metodo_pago, no medio_pago)
    const ordenRes = await client.query(
      `
      INSERT INTO ordenes (cliente_id, total, estado, direccion_entrega, metodo_pago)
      VALUES ($1, $2, 'PAGADA', $3, $4)
      RETURNING id, cliente_id, total, estado, direccion_entrega, metodo_pago, creado_en
      `,
      [usuario_id, total, direccion_entrega, medio_pago]
    );

    const orden = ordenRes.rows[0];

    // 9) Insertar items de la orden y descontar stock
    for (const item of items) {
      const subtotal = Number(item.precio) * item.cantidad;

      // 9.1 Insertar en orden_items (incluye subtotal porque es NOT NULL)
      await client.query(
        `
        INSERT INTO orden_items (orden_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [orden.id, item.producto_id, item.cantidad, item.precio, subtotal]
      );

      // 9.2 Descontar stock del producto
      await client.query(
        `
        UPDATE productos
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.cantidad, item.producto_id]
      );
    }

    // 10) Vaciar el carrito
    await client.query('DELETE FROM carrito_items WHERE carrito_id = $1', [carrito_id]);
    // (Opcional) marcar carrito como completado si tienes columna estado
    // await client.query('UPDATE carritos SET estado = $1 WHERE id = $2', ['COMPLETADO', carrito_id]);

    // 11) Confirmar transacción
    await client.query('COMMIT');

    return res.status(201).json({
      mensaje: 'Orden creada y pago procesado correctamente',
      orden: {
        ...orden,
        total,
        items: items.map(i => ({
          producto_id: i.producto_id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precio_unitario: i.precio,
          subtotal: Number(i.precio) * i.cantidad
        }))
      }
    });

  } catch (error) {
    console.error('Error en crearOrden:', error);
    await client.query('ROLLBACK');
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

/**
 * RF-12: Visualiza el seguimiento de compra
 *
 * GET /ordenes/seguimiento/:ordenId?usuarioId=2
 *
 * Restricción:
 *  - Solo el cliente dueño de la orden puede verla.
 */
exports.verSeguimientoOrden = async (req, res) => {
  try {
    const { ordenId } = req.params;
    const { usuarioId } = req.query;

    // Validaciones básicas
    if (!ordenId) {
      return res.status(400).json({ mensaje: 'Debe indicar el id de la orden en la URL' });
    }

    if (!usuarioId) {
      return res.status(400).json({ mensaje: 'Debe indicar usuarioId (cliente logeado)' });
    }

    // 1) Obtener la orden y verificar que pertenezca al usuario
    const ordenRes = await pool.query(
      `
      SELECT
        id,
        cliente_id,
        estado,
        total,
        direccion_entrega,
        lugar_entrega,
        transportista,
        ubicacion_actual,
        fecha_estim_entrega,
        metodo_pago,
        creado_en
      FROM ordenes
      WHERE id = $1
        AND cliente_id = $2
      `,
      [ordenId, usuarioId]
    );

    if (ordenRes.rowCount === 0) {
      // Puede ser que no exista o que no pertenezca al usuario
      return res.status(404).json({
        mensaje: 'Orden no encontrada para este usuario'
      });
    }

    const orden = ordenRes.rows[0];

    // 2) Obtener productos asociados a la orden
    const itemsRes = await pool.query(
      `
      SELECT
        oi.producto_id,
        p.nombre,
        p.descripcion,
        oi.cantidad,
        oi.precio_unitario,
        oi.subtotal
      FROM orden_items oi
      JOIN productos p ON p.id = oi.producto_id
      WHERE oi.orden_id = $1
      ORDER BY p.nombre ASC
      `,
      [ordenId]
    );

    const productos = itemsRes.rows;

    // 3) Armar respuesta de seguimiento según RF-12
    return res.json({
      mensaje: 'Seguimiento de orden',
      seguimiento: {
        orden_id: orden.id,
        estado: orden.estado,
        descripcion: `Pedido con ${productos.length} producto(s) en Nutri Bowl`,
        ubicacion_actual: orden.ubicacion_actual,
        lugar_entrega: orden.lugar_entrega || orden.direccion_entrega,
        direccion_entrega: orden.direccion_entrega,
        transportista: orden.transportista,
        fecha_estim_entrega: orden.fecha_estim_entrega,
        total: orden.total,
        metodo_pago: orden.metodo_pago,
        productos: productos.map(p => ({
          producto_id: p.producto_id,
          nombre: p.nombre,
          descripcion: p.descripcion,
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario,
          subtotal: p.subtotal
        }))
      }
    });

  } catch (error) {
    console.error('Error en verSeguimientoOrden:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};
