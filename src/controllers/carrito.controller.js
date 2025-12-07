const pool = require('../db');

/**
 * RF-9: Ingresar productos al carrito de compra
 * 
 * POST /carrito/agregar
 * 
 * Body:
 * {
 *   "usuario_id": 2,
 *   "producto_id": 5,
 *   "cantidad": 2
 * }
 */
exports.agregarProducto = async (req, res) => {
  try {
    const { usuario_id, producto_id, cantidad } = req.body;

    if (!usuario_id || !producto_id || !cantidad) {
      return res.status(400).json({
        mensaje: "usuario_id, producto_id y cantidad son obligatorios"
      });
    }

    // 1) Verificar que el usuario exista
    const usuario = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [usuario_id]
    );

    if (usuario.rowCount === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // 2) Verificar que el producto exista y tenga stock
    const producto = await pool.query(
      "SELECT id, nombre, precio, stock FROM productos WHERE id = $1",
      [producto_id]
    );

    if (producto.rowCount === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    if (producto.rows[0].stock < cantidad) {
      return res.status(400).json({ mensaje: "Stock insuficiente" });
    }

    // 3) Verificar si el carrito ya existe para este usuario
    // ⚠️ OJO: aquí usamos cliente_id si así se llama en la BD
    let carrito = await pool.query(
      "SELECT id FROM carritos WHERE cliente_id = $1",
      [usuario_id]
    );

    let carrito_id;

    if (carrito.rowCount === 0) {
      // Crear carrito nuevo
      const nuevoCarrito = await pool.query(
        "INSERT INTO carritos (cliente_id) VALUES ($1) RETURNING id",
        [usuario_id]
      );
      carrito_id = nuevoCarrito.rows[0].id;
    } else {
      carrito_id = carrito.rows[0].id;
    }

    // 4) Verificar si el producto ya está en el carrito
    const itemExistente = await pool.query(
      `SELECT id, cantidad
       FROM carrito_items
       WHERE carrito_id = $1 AND producto_id = $2`,
      [carrito_id, producto_id]
    );

    let item;

    if (itemExistente.rowCount > 0) {
      const nuevaCantidad = itemExistente.rows[0].cantidad + cantidad;

      item = await pool.query(
        `UPDATE carrito_items
         SET cantidad = $1
         WHERE id = $2
         RETURNING *`,
        [nuevaCantidad, itemExistente.rows[0].id]
      );
    } else {
      item = await pool.query(
        `INSERT INTO carrito_items (carrito_id, producto_id, cantidad)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [carrito_id, producto_id, cantidad]
      );
    }

    return res.json({
      mensaje: "Producto agregado al carrito",
      item: item.rows[0]
    });

  } catch (error) {
    console.error("Error en agregarProducto:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};