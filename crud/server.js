import express from "express";
import mysql from "mysql2/promise";

const app = express();

// Configuración de conexión a MySQL
const DB_HOST = "localhost";
const DB_USER = "root";
const DB_PASSWORD = "12345678";
const DB_NAME = "ddp";
const PORT = 4000;

// Body parsers (para base64 grandes)
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(express.json({ limit: "15mb" }));

// Conexión MySQL (pool)
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helpers
async function getByCodigo (codigo) {
  const [rows] = await pool.query(
    "SELECT * FROM juliacadata WHERE codigodepredio = ? LIMIT 1",
    [codigo]
  );
  return rows[0] || null;
}
async function insertRegistro (codigo, observacion, fotoBase64) {
  const [result] = await pool.query(
    `INSERT INTO juliacadata (codigodepredio, observacion, foto_registrar)
     VALUES (?, ?, ?)`,
    [codigo, observacion ?? null, fotoBase64 ?? null]
  );
  return result.insertId;
}
async function updateRegistro (codigo, observacion, fotoBase64) {
  const [result] = await pool.query(
    `UPDATE juliacadata
     SET observacion = ?, foto_registrar = ?
     WHERE codigodepredio = ?`,
    [observacion ?? null, fotoBase64 ?? null, codigo]
  );
  return result.affectedRows;
}

// Vista simple en HTML con Tailwind (CDN)
function renderPage ({ codigo = "", record = null, message = "", error = "" }) {
  const currentObs = record?.observacion ?? "";
  const currentPhoto = record?.foto_registrar ?? "";
  const hasPhoto = currentPhoto && currentPhoto.trim() !== "" && currentPhoto !== "null";
  const currentTitular = record?.sujetopasivo ?? "";
  const currentEstadoPago = record?.estadodepago ?? "";
  const currentTipoPredio = record?.tipodepredio ?? "";
  const currentAreaMetros = record?.areaenmetroscuadrados ?? "";
  const currentModalidad = record?.modalidaddeadquisicion ?? "";
  const currentProyecto = record?.nombredelproyecto ?? "";
  const currentPartida = record?.numerodepartidaregistral ?? "";
  const currentResolucion = record?.nresolucion ?? "";
  const currentFechaResolucion = record?.fechaderesolucion ?? "";
  const currentAreaHectareas = record?.areaenhectareas ?? "";
  const currentAfectacion = record?.tipodeafectaciontotaloparcial ?? "";
  const currentLatitud = record?.latitud ?? "";
  const currentLongitud = record?.longitud ?? "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Registro Observación y Foto</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
  <div class="max-w-4xl mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">Formulario juliacadata</h1>

    <form method="GET" action="/" class="mb-4 bg-white rounded-xl shadow p-3">
      <label class="block text-sm font-medium">Código de Predio</label>
      <div class="flex gap-2">
        <input type="text" name="codigo" required class="w-full border rounded px-2 py-1"
               value="${escapeHtml(codigo)}" placeholder="Ej: PM2G-AERJULIACA-PU-557"/>
        <button class="px-3 py-1 bg-blue-600 text-white rounded">Buscar</button>
      </div>
    </form>

    ${message ? `<div class="mb-2 p-2 bg-green-100 text-green-700">${escapeHtml(message)}</div>` : ""}
    ${error ? `<div class="mb-2 p-2 bg-red-100 text-red-700">${escapeHtml(error)}</div>` : ""}

    ${record ? `
    <!-- Información del Predio (Solo Lectura) -->
    <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
      <h2 class="text-lg font-semibold text-blue-800 mb-3">Información del Predio</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-600">Código de Predio</label>
          <div class="text-sm bg-white border rounded px-2 py-1 font-mono">${escapeHtml(codigo)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Nombre del Proyecto</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentProyecto)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Titular (Sujeto Pasivo)</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentTitular)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">N° Partida Registral</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentPartida)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">N° Resolución</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentResolucion)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Fecha Resolución</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentFechaResolucion)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Estado de Pago</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentEstadoPago)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Tipo de Predio</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentTipoPredio)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Modalidad de Adquisición</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentModalidad)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Área (m²)</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentAreaMetros)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Área (Hectáreas)</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentAreaHectareas)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Tipo de Afectación</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentAfectacion)}</div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-600">Coordenadas</label>
          <div class="text-sm bg-white border rounded px-2 py-1">${escapeHtml(currentLatitud)}, ${escapeHtml(currentLongitud)}</div>
        </div>
      </div>
    </div>
    ` : ""}

    <!-- Formulario de Edición (Solo Observación y Foto) -->
    <form method="POST" action="/save" class="bg-white rounded-xl shadow p-3 space-y-3" onsubmit="return beforeSubmit()">
      <input type="hidden" name="foto_base64" id="foto_base64"/>
      <input type="hidden" name="codigo" value="${escapeHtml(codigo)}"/>
      
      <div>
        <label class="block text-sm font-medium">Observación</label>
        <textarea name="observacion" rows="3" class="w-full border rounded px-2 py-1" 
                  placeholder="Ingrese la observación del predio...">${escapeHtml(currentObs)}</textarea>
      </div>
             <div>
         <label class="block text-sm font-medium">Foto</label>
         <input type="file" id="foto_file" accept="image/*" capture="environment" class="w-full text-sm"/>
         <div id="preview_wrap" class="mt-2 ${hasPhoto ? "" : "hidden"}">
           <img id="preview_img" src="${hasPhoto ? currentPhoto : ""}" class="max-h-64 border rounded" onerror="this.style.display='none'; this.parentElement.classList.add('hidden');"/>
         </div>
         ${!hasPhoto ? '<div class="mt-2 p-3 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">No hay foto registrada</div>' : ''}
       </div>
      <button class="px-3 py-1 bg-emerald-600 text-white rounded">Guardar</button>
    </form>
  </div>

<script>
function toBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = err => rej(err);
    reader.readAsDataURL(file);
  });
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('foto_file');
  const hidden = document.getElementById('foto_base64');
  const preview = document.getElementById('preview_wrap');
  const img = document.getElementById('preview_img');
  
  // Si hay una foto existente, establecerla en el campo hidden
  if (img.src && img.src !== 'data:,' && !img.src.includes('undefined') && img.src !== window.location.href && img.src.length > 100) {
    hidden.value = img.src;
    console.log('Foto existente encontrada:', img.src.substring(0, 50) + '...');
  } else {
    console.log('No hay foto existente o es inválida');
  }
  
  fileInput?.addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    const b64 = await toBase64(f);
    hidden.value = b64;
    img.src = b64;
    preview.classList.remove('hidden');
  });
});

function beforeSubmit(){
  if(!document.getElementById('codigo').value.trim()){
    alert("Debes ingresar un código");
    return false;
  }
  return true;
}
</script>
</body>
</html>`;
}
function escapeHtml (str = "") { return String(str).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }

// Rutas
app.get("/", async (req, res) => {
  const codigo = (req.query.codigo || "").trim();
  let record = null;
  if (codigo) { record = await getByCodigo(codigo); }
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(renderPage({ codigo, record }));
});
app.post("/save", async (req, res) => {
  const { codigo, observacion, foto_base64 } = req.body || {};
  const code = (codigo || "").trim();
  if (!code) { return res.send(renderPage({ error: "Código obligatorio" })); }
  try {
    const exists = await getByCodigo(code);
    if (exists) {
      await updateRegistro(code, observacion, foto_base64 || exists.foto_registrar);
      const updated = await getByCodigo(code);
      return res.send(renderPage({ codigo: code, record: updated, message: "Registro actualizado" }));
    } else {
      await insertRegistro(code, observacion, foto_base64 || null);
      const created = await getByCodigo(code);
      return res.send(renderPage({ codigo: code, record: created, message: "Registro creado" }));
    }
  } catch (e) {
    console.error(e);
    res.send(renderPage({ codigo: code, error: "Error guardando" }));
  }
});

app.listen(PORT, () => console.log("Servidor en http://localhost:" + PORT));
