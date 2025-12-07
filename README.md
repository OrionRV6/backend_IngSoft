INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN

1. REQUISITOS PREVIOS:
   - Tener instalado Node.js
   - Tener instalado PostgreSQL

2. INSTALACIÓN DE DEPENDENCIAS:
   Abra una terminal en la carpeta raíz del proyecto y ejecute:
   npm install

3. BASE DE DATOS:
   a. Cree una base de datos en PostgreSQL llamada "tienda_db".
   b. Ejecute el script ubicado en "db/schema_and_seed.sql" para crear las tablas y los datos de prueba.
   c. Verifique el archivo ".env" y configure su usuario y contraseña de base de datos.

4. EJECUCIÓN:
   Para iniciar el servidor, ejecute:
   npm start

   El servidor iniciará en http://localhost:3000



GUÍA DE PRUEBAS COMPLETAS (RF-1 AL RF-20) CON THUNDER CLIENT

OBJETIVO: Verificar la correcta implementación de los 20 Requisitos Funcionales del Backend.

PREPARACIÓN PREVIA:
1. Asegúrese de que el servidor esté corriendo: npm start (http://localhost:3000).
2. Verifique que la base de datos tenga los datos semilla (ejecutar db/schema_and_seed.sql).
3. Datos para pruebas:
    - ID 1: Admin (Rol ADMIN)
    - ID 2: Cliente Existente (Rol CLIENTE)
    - ID Producto 1: "Bowl Clásico Pollo"

==================================================
BLOQUE 1: ACCESO Y CONFIGURACIÓN (RF-1, RF-2, RF-3, RF-7)
==================================================

# PRUEBA 1 (RF-1): Iniciar Sesión
- Método: POST
- URL: http://localhost:3000/auth/login
- Body (JSON):
  {
    "correo": "cliente1@correo.cl",
    "contrasena": "cliente123"
  }
- Resultado: 200 OK. Devuelve objeto usuario.

# PRUEBA 2 (RF-2): Recuperar Contraseña
- Método: POST
- URL: http://localhost:3000/auth/forgot-password
- Body (JSON):
  {
    "correo": "cliente1@correo.cl"
  }
- Resultado: 200 OK. Mensaje simulado de envío de correo.

# PRUEBA 3 (RF-3): Cerrar Sesión
- Método: POST
- URL: http://localhost:3000/auth/logout
- Resultado: 200 OK.

# PRUEBA 4 (RF-7 Parte A): Listar Idiomas
- Método: GET
- URL: http://localhost:3000/idiomas
- Resultado: 200 OK. Lista [es-CL, en-US].

# PRUEBA 5 (RF-7 Parte B): Cambiar Idioma Usuario
- Método: PUT
- URL: http://localhost:3000/usuarios/2/idioma
- Body (JSON):
  {
    "codigoIdioma": "en-US"
  }
- Resultado: 200 OK. Usuario 2 actualizado a inglés.

==================================================
BLOQUE 2: INFORMACIÓN PÚBLICA Y REGISTRO (RF-4, RF-5, RF-6, RF-8)
==================================================

# PRUEBA 6 (RF-8): Registrar Nuevo Cliente
- Método: POST
- URL: http://localhost:3000/usuarios
- Body (JSON):
  {
    "nombre": "Usuario Pruebas",
    "correo": "pruebas@thunder.cl",
    "contrasena": "123456",
    "direccion": "Calle Test 999"
  }
- Resultado: 201 Created. IMPORTANTE: Anote el ID del nuevo usuario (será ID 5).

# PRUEBA 7 (RF-4): Ver Catálogo de Productos
- Método: GET
- URL: http://localhost:3000/productos
- Resultado: 200 OK. Lista de productos.

# PRUEBA 8 (RF-5): Ver Redes Sociales
- Método: GET
- URL: http://localhost:3000/redes-sociales
- Resultado: 200 OK. Lista de redes.

# PRUEBA 9 (RF-6): Ver Páginas Complementarias
- Método: GET
- URL: http://localhost:3000/paginas
- Resultado: 200 OK. Lista de páginas (Quiénes Somos, etc.).

==================================================
BLOQUE 3: COMPRA Y SEGUIMIENTO (RF-9, RF-10, RF-12, RF-11, RF-13)
==================================================

# PRUEBA 10 (RF-9): Agregar al Carrito (Usando Usuario ID 5)
- Método: POST
- URL: http://localhost:3000/carrito/agregar
- Body (JSON):
  {
    "usuario_id": 5, 
    "producto_id": 1, 
    "cantidad": 1
  }
- Resultado: 200 OK.

# PRUEBA 11 (RF-10): Pagar / Crear Orden
- Método: POST
- URL: http://localhost:3000/ordenes
- Body (JSON):
  {
    "usuario_id": 5,
    "medio_pago": "DEBITO",
    "direccion_entrega": "Calle Test 999"
  }
- Resultado: 201 Created. Se genera Orden (Supongamos ID 1).

# PRUEBA 12 (RF-11): Ver Notificaciones
- Método: GET
- URL: http://localhost:3000/notificaciones/2 (opcional ?soloNoLeidas=true)
- Resultado: 200 OK. Notificaciones del usuario 2.

# PRUEBA 13 (RF-12): Seguimiento de Orden
- Método: GET
- URL: http://localhost:3000/ordenes/seguimiento/1?usuarioId=5
- Resultado: 200 OK. Detalle de la orden creada.

# PRUEBA 14 (RF-13): Valorar Producto (Reseña)
- Método: POST
- URL: http://localhost:3000/resenas
- Body (JSON):
  {
    "usuario_id": 5,
    "producto_id": 1, 
    "puntuacion": 5,
    "comentario": "Excelente producto, recomendado."
  }
- Resultado: 201 Created.

==================================================
BLOQUE 4: ADMINISTRACIÓN (RF-14 a RF-19)
==================================================

# PRUEBA 15 (RF-14): Crear Producto
- Método: POST
- URL: http://localhost:3000/admin/productos
- Body (JSON):
  {
    "nombre": "Producto Admin Test",
    "descripcion": "Creado por admin",
    "precio": 5000,
    "stock": 20,
    "categoria": "Test",
    "imagen_url": "img.jpg"
  }
- Resultado: 201 Created. Anote el ID (será ID 11 apróx).

# PRUEBA 16 (RF-15): Eliminar Producto
- Método: DELETE
- URL: http://localhost:3000/admin/productos/11
- Resultado: 200 OK.

# PRUEBA 17 (RF-16): Ver Proveedores
- Método: GET
- URL: http://localhost:3000/admin/proveedores
- Resultado: 200 OK.

# PRUEBA 18 (RF-17): Ver Clientes
- Método: GET
- URL: http://localhost:3000/admin/clientes
- Resultado: 200 OK. Lista de usuarios clientes.

# PRUEBA 19 (RF-18): Listar Soporte
- Método: GET
- URL: http://localhost:3000/admin/soporte
- Resultado: 200 OK. Lista de tickets.

# PRUEBA 20 (RF-19): Responder Solicitud
- Método: PUT
- URL: http://localhost:3000/admin/soporte/2
- Body (JSON):
  {
    "estado": "CERRADA",
    "prioridad": "BAJA",
    "respuesta": "Solucionado por el admin."
  }
- Resultado: 200 OK.

==================================================
BLOQUE 5: MANTENIMIENTO (RF-20)
==================================================

# PRUEBA 21 (RF-20): Ejecutar Optimización
- Método: POST
- URL: http://localhost:3000/admin/mantenimiento
- Body (JSON):
  {
    "usuario_id": 1,
    "descripcion": "Limpieza general pre-entrega"
  }
- Resultado: 200 OK. Tarea registrada.