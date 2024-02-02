import express from 'express';
import mysql from 'mysql';
import cors from 'cors';

// Creamos la instancia de express
const app = express();
app.use(express.json());
app.use(cors());

// Creamos la conexión a la base de datos
const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "iot_examen",
});

// Verificamos la conexión
conexion.connect(function (error) {
  if (error) {
    console.log("No fue posible la conexión");
  } else {
    console.log("Conexión exitosa");
  }
});

// Iniciamos el servidor
app.listen(3000, () => {
  console.log("Servidor iniciado");
});

// Consultar todos los fotoresistores
app.get("/obtener", (peticion, respuesta) => {
    const sql = "SELECT * FROM fotoresistor";
    conexion.query(sql, (error, resultado) => {
      if (error) return respuesta.json({ mensaje: "Error" });
      return respuesta.json({ Estatus: "exitoso", contenido: resultado });
    });
});

// Obtener datos por rango de valor
app.get("/obtenerRango", (req, res) => {
  const { minimo, maximo } = req.query; // Usa req.query para acceder a los parámetros de consulta

  if (isNaN(minimo) || isNaN(maximo)) {
    return res.status(400).json({ Estatus: "Error", mensaje: "Los parámetros deben ser numéricos" });
  }
  const valorMinimo = parseInt(minimo, 10);
  const valorMaximo = parseInt(maximo, 10);

  const sql = "SELECT * FROM fotoresistor WHERE valor BETWEEN ? AND ?";

  conexion.query(sql, [valorMinimo, valorMaximo], (error, resultado) => {
    if (error) {
      return res.status(500).json({ Estatus: "Error", mensaje: error.message });
    }
    return res.json({ Estatus: "Exitoso", contenido: resultado });
  });
});


// Crear un nuevo registro de fotoresistor
app.post("/crear", (peticion, respuesta) => {
    const { id_puerto_serial, valor, intensidad } = peticion.body;
    const sql = "INSERT INTO fotoresistor (valor, intensidad) VALUES (?, ?)";
    conexion.query(sql, [id_puerto_serial, valor, intensidad], (error, resultado) => {
      if (error) return respuesta.json({ Estatus: "Error", mensaje: error.message });
      return respuesta.json({ Estatus: "exitoso", id: resultado.insertId });
    });
});

// Actualizar un registro de fotoresistor existente
app.put("/actualizar/:id", (peticion, respuesta) => {
    const { id } = peticion.params;
    const { valor, intensidad } = peticion.body;
    const sql = "UPDATE fotoresistor SET valor = ?, intensidad = ? WHERE id_puerto_serial = ?";
    conexion.query(sql, [valor, intensidad, id], (error, resultado) => {
      if (error) return respuesta.json({ Estatus: "Error", mensaje: error.message });
      if (resultado.affectedRows === 0) return respuesta.json({ Estatus: "Error", mensaje: "Fotoresistor no encontrado" });
      return respuesta.json({ Estatus: "exitoso" });
    });
});

// Eliminar un registro de fotoresistor
app.delete("/eliminar/:id", (peticion, respuesta) => {
    const { id } = peticion.params;
    const sql = "DELETE FROM fotoresistor WHERE id_puerto_serial = ?";
    conexion.query(sql, [id], (error, resultado) => {
      if (error) return respuesta.json({ Estatus: "Error", mensaje: error.message });
      if (resultado.affectedRows === 0) return respuesta.json({ Estatus: "Error", mensaje: "Fotoresistor no encontrado" });
      return respuesta.json({ Estatus: "exitoso" });
    });
});
