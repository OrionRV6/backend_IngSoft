-- =========================================================
-- ELIMINAR TABLAS (si existen) - RESPETAR EL ORDEN
-- =========================================================
DROP TABLE IF EXISTS orden_items;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS carrito_items;
DROP TABLE IF EXISTS carritos;
DROP TABLE IF EXISTS resenas;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS solicitudes_soporte;
DROP TABLE IF EXISTS tareas_mantenimiento;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS paginas;
DROP TABLE IF EXISTS redes_sociales;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS idiomas;



-- =========================================================
-- TABLA: idiomas (para RF de idioma)
-- =========================================================
CREATE TABLE idiomas (
    codigo        VARCHAR(10) PRIMARY KEY,      -- ej: 'es-CL', 'en-US'
    nombre        VARCHAR(50) NOT NULL
);

-- =========================================================
-- TABLA: usuarios (clientes, admins, mantenimiento, etc.)
-- =========================================================
CREATE TABLE usuarios (
    id                 SERIAL PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    correo             VARCHAR(120) NOT NULL UNIQUE,
    contraseña_hash    VARCHAR(255) NOT NULL,
    direccion          VARCHAR(255),
    rol                VARCHAR(30) NOT NULL,   -- 'ADMIN', 'CLIENTE', 'SOPORTE', 'MANTENIMIENTO', etc.
    estado_cuenta      VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO / BLOQUEADO
    idioma_preferido   VARCHAR(10) REFERENCES idiomas(codigo),
    creado_en          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: redes_sociales (RF-5)
-- =========================================================
CREATE TABLE redes_sociales (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(50) NOT NULL,       -- Ej: 'Instagram', 'Facebook'
    url          VARCHAR(255) NOT NULL,
    icono        VARCHAR(100)                -- nombre de icono o clase CSS, opcional
);

-- =========================================================
-- TABLA: paginas complementarias (RF-6)
-- =========================================================
CREATE TABLE paginas (
    id           SERIAL PRIMARY KEY,
    slug         VARCHAR(100) NOT NULL UNIQUE, -- 'quienes-somos', 'contacto', etc.
    titulo       VARCHAR(150) NOT NULL,
    contenido    TEXT NOT NULL,
    orden        INT
);

-- =========================================================
-- TABLA: productos (catálogo RF-4, gestión RF-14, RF-15, RF-13)
-- =========================================================
CREATE TABLE productos (
    id             SERIAL PRIMARY KEY,
    nombre         VARCHAR(150) NOT NULL UNIQUE,
    descripcion    TEXT,
    imagen_url     VARCHAR(255),
    precio         NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    stock          INT NOT NULL CHECK (stock >= 0),
    categoria      VARCHAR(100),
    audio_url      VARCHAR(255),            -- para descripción audible (opcional)
    creado_en      TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP
);

-- =========================================================
-- TABLA: carritos (RF-9)
-- =========================================================
CREATE TABLE carritos (
    id             SERIAL PRIMARY KEY,
    cliente_id     INT NOT NULL REFERENCES usuarios(id),
    estado         VARCHAR(20) NOT NULL DEFAULT 'ACTIVO', -- ACTIVO / CERRADO
    creado_en      TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP
);

-- =========================================================
-- TABLA: carrito_items (ítems dentro del carrito RF-9)
-- =========================================================
CREATE TABLE carrito_items (
    id           SERIAL PRIMARY KEY,
    carrito_id   INT NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
    producto_id  INT NOT NULL REFERENCES productos(id),
    cantidad     INT NOT NULL CHECK (cantidad > 0),

    CONSTRAINT carrito_item_unico UNIQUE (carrito_id, producto_id)
);

-- =========================================================
-- TABLA: ordenes (RF-10, RF-12)
-- =========================================================
CREATE TABLE ordenes (
    id                   SERIAL PRIMARY KEY,
    cliente_id           INT NOT NULL REFERENCES usuarios(id),
    estado               VARCHAR(30) NOT NULL, -- PENDIENTE, PAGADA, ENVIADA, ENTREGADA, CANCELADA
    metodo_pago          VARCHAR(50) NOT NULL, -- Debito, Crédito, Transferencia, etc.
    total                NUMERIC(10,2) NOT NULL CHECK (total >= 0),

    lugar_entrega        VARCHAR(255),
    direccion_entrega    VARCHAR(255),
    transportista        VARCHAR(100),
    ubicacion_actual     VARCHAR(255),      -- para tracking de la orden
    fecha_estim_entrega  DATE,

    creado_en            TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: orden_items (detalle de productos por orden RF-10)
-- =========================================================
CREATE TABLE orden_items (
    id              SERIAL PRIMARY KEY,
    orden_id        INT NOT NULL REFERENCES ordenes(id) ON DELETE CASCADE,
    producto_id     INT NOT NULL REFERENCES productos(id),
    cantidad        INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- =========================================================
-- TABLA: notificaciones (RF-11)
-- =========================================================
CREATE TABLE notificaciones (
    id           SERIAL PRIMARY KEY,
    usuario_id   INT NOT NULL REFERENCES usuarios(id),
    titulo       VARCHAR(150) NOT NULL,
    mensaje      TEXT NOT NULL,
    leida        BOOLEAN NOT NULL DEFAULT FALSE,
    creada_en    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================================
-- TABLA: resenas / valoraciones de productos (RF-13)
-- =========================================================
CREATE TABLE resenas (
    id           SERIAL PRIMARY KEY,
    producto_id  INT NOT NULL REFERENCES productos(id),
    cliente_id   INT NOT NULL REFERENCES usuarios(id),
    puntuacion   INT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario   VARCHAR(200),
    creado_en    TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT resena_unica_cliente_producto UNIQUE (producto_id, cliente_id)
);

-- =========================================================
-- TABLA: proveedores (RF-16)
-- =========================================================
CREATE TABLE proveedores (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    contacto    VARCHAR(100),
    telefono    VARCHAR(50),
    correo      VARCHAR(120),
    direccion   VARCHAR(255),
    sitio_web   VARCHAR(255),
    activo      BOOLEAN NOT NULL DEFAULT TRUE
);

-- =========================================================
-- TABLA: solicitudes de soporte (RF-18, RF-19)
-- =========================================================
CREATE TABLE solicitudes_soporte (
    id          SERIAL PRIMARY KEY,
    cliente_id  INT NOT NULL REFERENCES usuarios(id),
    asunto      VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    estado      VARCHAR(30) NOT NULL DEFAULT 'ABIERTA', -- ABIERTA, EN_PROCESO, CERRADA
    prioridad   VARCHAR(20) NOT NULL DEFAULT 'MEDIA',   -- BAJA, MEDIA, ALTA
    canal       VARCHAR(50),                            -- web, correo, etc.
    correo_enviado BOOLEAN NOT NULL DEFAULT FALSE,      -- notificación al cliente
    creado_en   TIMESTAMP NOT NULL DEFAULT NOW(),
    actualizado_en TIMESTAMP
);

-- =========================================================
-- TABLA: tareas de mantenimiento del sistema (RF-20)
-- =========================================================
CREATE TABLE tareas_mantenimiento (
    id           SERIAL PRIMARY KEY,
    usuario_id   INT REFERENCES usuarios(id),           -- quien ejecutó la tarea
    descripcion  TEXT NOT NULL,
    resultado    TEXT,
    ejecutada_en TIMESTAMP NOT NULL DEFAULT NOW()
);



-- ===============================================
-- INSERT: Idiomas
-- ===============================================
INSERT INTO idiomas (codigo, nombre) VALUES
('es-CL', 'Español (Chile)'),
('en-US', 'Inglés');

-- ===============================================
-- INSERT: Usuarios (ADMIN, CLIENTES, SOPORTE)
-- ===============================================
INSERT INTO usuarios (nombre, correo, contraseña_hash, direccion, rol, idioma_preferido)
VALUES
('Admin Nutri Bowl', 'admin@nutribowl.cl', 'admin123', 'Local Nutri Bowl, Centro', 'ADMIN', 'es-CL'),
('Cliente 1', 'cliente1@correo.cl', 'cliente123', 'Av. Siempre Viva 123', 'CLIENTE', 'es-CL'),
('Repartidor 1', 'repartidor1@correo.cl', 'repartidor123', 'Sector Norte', 'REPARTIDOR', 'es-CL'),
('Cajero 1', 'cajero1@correo.cl', 'cajero123', 'Local Nutri Bowl, Caja 1', 'CAJERO', 'es-CL');

-- ===============================================
-- INSERT: Redes Sociales (RF-5)
-- ===============================================
INSERT INTO redes_sociales (nombre, url, icono)
VALUES
('Instagram', 'https://instagram.com/mitienda', 'instagram'),
('Facebook', 'https://facebook.com/mitienda', 'facebook'),
('TikTok', 'https://tiktok.com/@mitienda', 'tiktok');

-- ===============================================
-- INSERT: Páginas Complementarias (RF-6)
-- ===============================================
INSERT INTO paginas (slug, titulo, contenido, orden)
VALUES
('quienes-somos', 'Quiénes Somos', 'Nutri Bowl es un local de comida rápida saludable, especializado en bowls personalizados con ingredientes frescos.', 1),
('contacto', 'Contacto', 'Puedes encontrarnos en el centro de la ciudad o escribirnos a contacto@nutribowl.cl para pedidos y consultas.', 2),
('preguntas-frecuentes', 'Preguntas Frecuentes', 'Resolvemos dudas sobre medios de pago, pedidos online y entregas a domicilio.', 3);

-- ===============================================
-- INSERT: Productos (catálogo RF-4)
-- ===============================================
INSERT INTO productos (nombre, descripcion, imagen_url, precio, stock, categoria)
VALUES
('Bowl Clásico Pollo', 'Bowl de arroz integral, pollo a la plancha, mix de hojas verdes y vegetales salteados.', NULL, 5990, 30, 'Bowl'),
('Bowl Veggie Quinoa', 'Quinoa, garbanzos, hummus, tomate cherry, pepino y zanahoria rallada.', NULL, 5790, 25, 'Bowl'),
('Bowl Teriyaki', 'Arroz blanco, pollo salteado en salsa teriyaki, brócoli, pimentón y sésamo.', NULL, 6290, 20, 'Bowl'),
('Bowl Proteico', 'Base de arroz integral, doble porción de pollo, porotos negros, palta y ensalada.', NULL, 6590, 15, 'Bowl'),
('Bowl Mediterráneo', 'Cuscús, tomate cherry, aceitunas, pepino, queso feta y mix de hojas.', NULL, 5990, 18, 'Bowl'),
('Jugo Natural Naranja', 'Jugo 100% natural de naranja, sin azúcar añadida.', NULL, 1990, 40, 'Bebida'),
('Jugo Natural Frutilla-Plátano', 'Batido de frutas naturales con frutilla y plátano.', NULL, 2190, 35, 'Bebida'),
('Agua Mineral 500ml', 'Botella de agua mineral sin gas.', NULL, 1200, 50, 'Bebida'),
('Extra Palta', 'Porción extra de palta para agregar a cualquier bowl.', NULL, 1000, 50, 'Extra'),
('Extra Proteína', 'Porción extra de pollo o garbanzos (según el bowl).', NULL, 1500, 40, 'Extra');

-- ===============================================
-- INSERT: Proveedores (RF-16)
-- ===============================================
INSERT INTO proveedores (nombre, contacto, telefono, correo, direccion, sitio_web)
VALUES
('Verduras Frescas Maule', 'Juan Pérez', '+56911112222', 'contacto@verdurasmaule.cl', 'Parcela 5, Sector Rural', 'https://verdurasmaule.cl'),
('Granos del Valle', 'Ana Morales', '+56933334444', 'ventas@granosvalle.cl', 'Ruta 5 km 23', 'https://granosvalle.cl'),
('Jugos Naturales Chile', 'Carlos Ruiz', '+56977778888', 'contacto@jugoschile.cl', 'Bodega 12, Parque Industrial', 'https://jugoschile.cl');

-- ===============================================
-- INSERT: Notificaciones (RF-11)
-- ===============================================
INSERT INTO notificaciones (usuario_id, titulo, mensaje)
VALUES
(2, 'Bienvenido a Nutri Bowl', 'Gracias por registrarte, ya puedes hacer tu primer pedido saludable.'),
(2, 'Promoción de la semana', 'Aprovecha 10% de descuento en el Bowl Veggie Quinoa.'),
(3, 'Nuevo pedido asignado', 'Se te ha asignado un nuevo pedido para reparto.');

-- ===============================================
-- INSERT: Solicitudes de soporte (RF-18, RF-19)
-- ===============================================
INSERT INTO solicitudes_soporte (cliente_id, asunto, descripcion, estado, prioridad, canal)
VALUES
(2, 'Duda sobre ingredientes', 'Quiero saber si el Bowl Proteico incluye gluten.', 'ABIERTA', 'MEDIA', 'web'),
(2, 'Problema con un pedido', 'Mi pedido llegó incompleto, faltaba el jugo.', 'EN_PROCESO', 'ALTA', 'web'),
(2, 'Sugerencia de menú', 'Sería genial tener una opción con tofu.', 'CERRADA', 'BAJA', 'correo');

-- ===============================================
-- INSERT: Tareas de mantenimiento (RF-20)
-- ===============================================
INSERT INTO tareas_mantenimiento (usuario_id, descripcion, resultado)
VALUES
(1, 'Optimización de base de datos', 'Se eliminaron registros antiguos.'),
(1, 'Reindexación de tablas', 'Tablas reindexadas correctamente.');