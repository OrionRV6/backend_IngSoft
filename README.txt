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