const morgan = require("morgan")
const cors = require("cors")
const express = require('express');
const app = express();
const port = 4000;

const pool = require('./db');
app.use(express.json());
app.use(morgan('dev'))
app.use(cors())

const imageUploadRouter = require('./uploadController');

app.use('/api', imageUploadRouter);

app.listen(port, () => {
  console.log(`Servidor en ejecución en el puerto ${port}`);
});
