const pool = require('./db');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const jwt = require('jsonwebtoken');
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const { initializeApp } = require("firebase/app");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Inicializa Firebase (debes hacerlo antes de usarlo)
const firebaseConfig = {
  apiKey: "AIzaSyB-BAU_Nn5SFVMMUIj3VSutURf2mcbfWYY",
  authDomain: "recolectorbasura-6ee29.firebaseapp.com",
  projectId: "recolectorbasura-6ee29",
  storageBucket: "recolectorbasura-6ee29.appspot.com",
  messagingSenderId: "4075619738",
  appId: "1:4075619738:web:792e83373a417392226623",
  measurementId: "G-ZKS50XN6NC"
};

const app = initializeApp(firebaseConfig);

/* Reporte */
router.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporcionó una imagen' });
    }

    const imageBuffer = req.file.buffer;
    if (!imageBuffer) {
      return res.status(400).json({ success: false, message: 'El archivo de imagen está vacío' });
    }

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const sanitizedFileName = req.file.originalname.replace(/[^a-z0-9]/gi, '_');
    const filename = `${formattedDate}_${sanitizedFileName}`;
    const contentType = req.file.mimetype; // Tipo MIME de la imagen

    const storage = getStorage(app); // Obtén el almacenamiento con la configuración de Firebase
    const storageRef = ref(storage, `images/${filename}`);
    await uploadBytes(storageRef, imageBuffer, { contentType }); // Define el tipo de contenido

    const location = `images/${filename}`; // Ruta en Firebase Storage
    const latitude = req.body.latitude;
    const longitude = req.body.longitude;
    const description = req.body.description;
    const dni = req.body.dni;

    // Obtiene la URL de la foto en Firebase Storage
    const storageReference = ref(storage, location);
    const firebasePhotoURL = await getDownloadURL(storageReference);

    // Inserta la foto y su URL en la base de datos PostgreSQL
    const ubicacionInsertQuery = 'INSERT INTO ubicacion_usuario (x, y) VALUES ($1, $2) RETURNING id_ubicacion';
    const ubicacionResult = await pool.query(ubicacionInsertQuery, [latitude, longitude]);
    const ubicacionId = ubicacionResult.rows[0].id_ubicacion;

    const fotoInsertQuery = 'INSERT INTO fotos (almacen_ubicacion, nombre_imagen) VALUES ($1, $2) RETURNING id_foto';
    const fotoResult = await pool.query(fotoInsertQuery, [firebasePhotoURL, filename]);
    const fotoId = fotoResult.rows[0].id_foto;

    const eventoInsertQuery = 'INSERT INTO evento (id_foto, id_ubicacion, descripcion, dni) VALUES ($1, $2, $3, $4)';
    await pool.query(eventoInsertQuery, [fotoId, ubicacionId, description, dni]);

    res.json({ success: true, message: 'Imagen subida correctamente', photoId: fotoId });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ success: false, message: 'Error al subir la imagen' });
  }
});


/* Ubicacion del usuario */
router.get('/fixed-location', async (req, res) => {
  try {
    const fixedLocationQuery = 'SELECT x, y FROM ubicacion_usuario';

    const result = await pool.query(fixedLocationQuery);

    if (result.rows.length > 0) {
      const fixedLocations = result.rows.map(row => ({
        latitude: row.x,
        longitude: row.y,
      }));
      res.json({ success: true, fixedLocations });
      console.log(fixedLocations);
    } else {
      res.status(404).json({ success: false, message: 'Ubicaciones fijas no encontradas' });
    }
  } catch (error) {
    console.error('Error al obtener las ubicaciones fijas:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las ubicaciones fijas' });
  }
});



/*Reporte de zonas reportadas del Backend */
router.get('/zonas-con-parametros', async (req, res) => {
  try {
    const query = `
      SELECT z.id_zona, p.x, p.y, z.nombre_zona
      FROM zona z
      INNER JOIN parametros p ON z.id_parametro = p.id_parametro
    `;

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const zonasConParametros = result.rows.map(row => ({
        id_zona: row.id_zona,
        x: row.x,
        y: row.y,
        nombre_zona: row.nombre_zona,
      }));
      res.json({ success: true, zonasConParametros });
    } else {
      res.status(404).json({ success: false, message: 'No se encontraron zonas con parámetros' });
    }
  } catch (error) {
    console.error('Error al obtener las zonas con parámetros:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las zonas con parámetros' });
  }
});

//------------------------------------------- Login -------------------------------------------------------


router.post('/login', async (req, res) => {
  try {
    const { dni, contraseña } = req.body;

    const userQuery = 'SELECT * FROM Usuario WHERE DNI = $1 AND contraseña = $2';
    const userResult = await pool.query(userQuery, [dni, contraseña]);

    if (userResult.rows.length > 0) {
      const token = jwt.sign({ dni: dni }, 'tu_secreto_secreto', { expiresIn: '1h' }); // El tercer argumento es el tiempo de expiración del token

      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ success: false, message: 'Error en la autenticación' });
  }
});

/*CRUD completo para crear un usuario */


router.post('/usuarios', async (req, res) => {
  try {
    const { DNI, contraseña, nombre, correo_electronico } = req.body;

    if (!DNI || !contraseña || !nombre || !correo_electronico) {
      return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    const userExistsQuery = 'SELECT * FROM Usuario WHERE DNI = $1';
    const userExistsResult = await pool.query(userExistsQuery, [DNI]);

    if (userExistsResult.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'El usuario ya existe' });
    }

    const insertUserQuery = 'INSERT INTO Usuario (DNI, contraseña, nombre, correo_electronico) VALUES ($1, $2, $3, $4)';
    await pool.query(insertUserQuery, [DNI, contraseña, nombre, correo_electronico]);

    res.json({ success: true, message: 'Usuario creado correctamente' });
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al crear el usuario' });
  }
});


router.get('/usuarios/:dni', async (req, res) => {
  try {
    const dni = req.params.dni;

    const getUserQuery = 'SELECT * FROM Usuario WHERE DNI = $1';
    const result = await pool.query(getUserQuery, [dni]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el usuario' });
  }
});



router.put('/usuarios/:dni', async (req, res) => {
  try {
    const dni = req.params.dni;
    const { contraseña, nombre, correo_electronico } = req.body;

    const updateUserQuery = 'UPDATE Usuario SET contraseña = $1, nombre = $2, correo_electronico = $3 WHERE DNI = $4';
    await pool.query(updateUserQuery, [contraseña, nombre, correo_electronico, dni]);

    res.json({ success: true, message: 'Usuario actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el usuario' });
  }
});


router.delete('/usuarios/:dni', async (req, res) => {
  try {
    const dni = req.params.dni;

    const deleteUserQuery = 'DELETE FROM Usuario WHERE DNI = $1';
    await pool.query(deleteUserQuery, [dni]);

    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el usuario' });
  }
});

//-------------------------------------------------------------------------------------------------


/*mostrar en pantalla  */
router.get('/eventos', async (req, res) => {
  try {
    const query = `
    SELECT 
      e.id_evento, 
      u.dni, 
      e.descripcion, 
      uu.x, 
      uu.y,
      EXTRACT(YEAR FROM f.fecha_tomada) AS ano,
      EXTRACT(MONTH FROM f.fecha_tomada) AS mes,
      EXTRACT(DAY FROM f.fecha_tomada) AS dia
    FROM evento e
    INNER JOIN Usuario u ON e.DNI = u.DNI
    INNER JOIN fotos f ON e.id_foto = f.id_foto
    INNER JOIN ubicacion_usuario uu ON uu.id_ubicacion = e.id_ubicacion;
    `;


    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const eventos = result.rows;
      res.json({ success: true, eventos });
    } else {
      res.status(404).json({ success: false, message: 'No se encontraron eventos' });
    }
  } catch (error) {
    console.error('Error al obtener los eventos:', error);
    res.status(500).json({ success: false, message: 'Error al obtener los eventos' });
  }
});


// Ruta para obtener la URL de descarga de una imagen por su ID
router.get('/imagen/:id', async (req, res) => {

  try {

    const id = req.params.id;

    if (!id) {

      return res.status(400).json({ success: false, message: 'Falta el parámetro ID' });

    }


    // Consulta a tu base de datos para obtener la URL de descarga de la imagen por su ID

    const query = 'SELECT almacen_ubicacion FROM fotos WHERE id_foto = $1';

    const result = await pool.query(query, [id]);


    if (result.rows.length > 0) {

      const imagen = result.rows[0].almacen_ubicacion;

      console.log("Imagen URL: ", imagen)

      res.json({ success: true, imagen });

    } else {

      res.status(404).json({ success: false, message: 'Imagen no encontrada' });

    }

  } catch (error) {

    console.error('Error al obtener la imagen:', error);

    res.status(500).json({ success: false, message: 'Error interno del servidor' });

  }

});


router.put('/edit-report/:id_evento', async (req, res) => {
  try {
    const id_evento = req.params.id_evento;
    const newDescription = req.body.description;

    // Realiza la lógica para actualizar la descripción del reporte en la base de datos
    const updateReportQuery = 'UPDATE evento SET descripcion = $1 WHERE id_evento = $2';
    await pool.query(updateReportQuery, [newDescription, id_evento]);

    res.json({ success: true, message: 'Descripción del reporte actualizada correctamente' });
  } catch (error) {
    console.error('Error al editar la descripción del reporte:', error);
    res.status(500).json({ success: false, message: 'Error al editar la descripción del reporte' });
  }
});


/*Depurara fotos por su informacion */


router.get('/depurar-fotos', async (req, res) => {
  try {
    const query = `
      SELECT
        id_foto,
        almacen_ubicacion,
        nombre_imagen,
        EXTRACT(YEAR FROM fecha_tomada) AS ano,
        EXTRACT(MONTH FROM fecha_tomada) AS mes,
        EXTRACT(DAY FROM fecha_tomada) AS dia,
        EXTRACT(HOUR FROM fecha_tomada) AS hora
      FROM fotos;
    `;

    const result = await pool.query(query);

    if (result.rows.length > 0) {
      const fotosDepuradas = result.rows;
      res.json({ success: true, fotosDepuradas });
    } else {
      res.status(404).json({ success: false, message: 'No se encontraron fotos' });
    }
  } catch (error) {
    console.error('Error al depurar la tabla de fotos:', error);
    res.status(500).json({ success: false, message: 'Error al depurar la tabla de fotos' });
  }
});



/*Elimnar evento  */
router.delete('/eliminar-evento/:id_evento', async (req, res) => {
  try {
    const id_evento = req.params.id_evento;

    // Obtener la información de la foto y la ubicación asociada al evento
    const queryEvento = 'SELECT id_foto, id_ubicacion FROM evento WHERE id_evento = $1';
    const resultEvento = await pool.query(queryEvento, [id_evento]);

    if (resultEvento.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Evento no encontrado' });
    }

    const { id_foto, id_ubicacion } = resultEvento.rows[0];

    // Eliminar el evento
    const deleteEventoQuery = 'DELETE FROM evento WHERE id_evento = $1';
    await pool.query(deleteEventoQuery, [id_evento]);

    // Eliminar la foto
    const deleteFotoQuery = 'DELETE FROM fotos WHERE id_foto = $1';
    await pool.query(deleteFotoQuery, [id_foto]);

    // Eliminar la ubicación de usuario
    const deleteUbicacionQuery = 'DELETE FROM ubicacion_usuario WHERE id_ubicacion = $1';
    await pool.query(deleteUbicacionQuery, [id_ubicacion]);

    res.json({ success: true, message: 'Evento y sus asociados eliminados correctamente' });
  } catch (error) {
    console.error('Error al eliminar el evento:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar el evento y sus asociados' });
  }
});



module.exports = router;