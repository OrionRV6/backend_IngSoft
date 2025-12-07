// src/index.js (ACTUALIZADO)

require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const redesRoutes = require('./routes/redes.routes');
const paginasRoutes = require('./routes/paginas.routes');
const idiomasRoutes = require('./routes/idiomas.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const carritoRoutes = require('./routes/carrito.routes');
const ordenesRoutes = require('./routes/ordenes.routes'); 
const notificacionesRoutes = require('./routes/notificaciones.routes');
const resenasRoutes = require('./routes/resenas.routes');
const adminRoutes = require('./routes/admin.routes'); 

app.use('/auth', authRoutes);
app.use('/productos', productosRoutes);
app.use('/redes-sociales', redesRoutes);
app.use('/paginas', paginasRoutes);
app.use('/idiomas', idiomasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/clientes', usuariosRoutes);
app.use('/carrito', carritoRoutes);
app.use('/ordenes', ordenesRoutes);  
app.use('/notificaciones', notificacionesRoutes);
app.use('/resenas', resenasRoutes);
app.use('/admin', adminRoutes); 

app.get('/', (req, res) => {
  res.send('Backend funcionando correctamente con 20 RF completados.');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});