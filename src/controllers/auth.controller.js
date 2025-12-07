const pool = require('../db');

// ==========================
// RF-1: LOGIN
// ==========================
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        mensaje: 'Debe enviar correo y contraseña'
      });
    }

    const query = `
      SELECT id, nombre, correo, contraseña_hash, rol, estado_cuenta
      FROM usuarios
      WHERE correo = $1
    `;
    const result = await pool.query(query, [correo]);

    if (result.rowCount === 0) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas (usuario)' });
    }

    const usuario = result.rows[0];

    if (usuario.estado_cuenta !== 'ACTIVO') {
      return res.status(403).json({ mensaje: 'Cuenta bloqueada o inactiva' });
    }

    if (usuario.contraseña_hash !== contrasena) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas (contraseña)' });
    }

    return res.json({
      mensaje: 'Login exitoso',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// ==========================
// RF-2: SOLICITAR RECUPERACIÓN
// ==========================
exports.forgotPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ mensaje: 'Debe enviar el correo' });
    }

    const result = await pool.query(
      `SELECT id FROM usuarios WHERE correo = $1`,
      [correo]
    );

    // Respuesta igual para existir/no existir (seguridad)
    return res.json({
      mensaje: 'Si el correo existe, se enviaron instrucciones (simulado)'
    });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// ==========================
// RF-2: RESETEAR CONTRASEÑA
// ==========================
exports.resetPassword = async (req, res) => {
  try {
    const { correo, nuevaContrasena } = req.body;

    if (!correo || !nuevaContrasena) {
      return res.status(400).json({
        mensaje: 'Debe enviar correo y nuevaContrasena'
      });
    }

    const usuario = await pool.query(
      `SELECT id FROM usuarios WHERE correo = $1`,
      [correo]
    );

    if (usuario.rowCount === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    await pool.query(
      `UPDATE usuarios SET contraseña_hash = $1 WHERE correo = $2`,
      [nuevaContrasena, correo]
    );

    return res.json({
      mensaje: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// ==========================
// RF-3: CIERRE DE SESIÓN (LOGOUT)
// ==========================
exports.logout = async (req, res) => {
  try {
    // Como no estamos usando sesiones en servidor ni JWT
    // el "logout" se maneja principalmente en el frontend.
    // Aquí simplemente respondemos OK.
    return res.json({
      mensaje: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};