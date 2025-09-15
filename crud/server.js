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

async function getAllPredios (searchTerm = "", page = 1, limit = 50) {
  let query = "SELECT codigodepredio, nombredelproyecto, sujetopasivo, estadodepago, tipodepredio, areaenmetroscuadrados, observacion, foto_registrar FROM juliacadata";
  let countQuery = "SELECT COUNT(*) as total FROM juliacadata";
  let params = [];

  if (searchTerm && searchTerm.trim() !== "") {
    const whereClause = " WHERE codigodepredio LIKE ? OR nombredelproyecto LIKE ? OR sujetopasivo LIKE ? OR observacion LIKE ?";
    query += whereClause;
    countQuery += whereClause;
    const searchPattern = `%${searchTerm.trim()}%`;
    params = [searchPattern, searchPattern, searchPattern, searchPattern];
  }

  query += " ORDER BY codigodepredio LIMIT ? OFFSET ?";

  // Calcular offset
  const offset = (page - 1) * limit;
  const queryParams = [...params, limit, offset];

  // Ejecutar ambas consultas
  const [rows] = await pool.query(query, queryParams);
  const [countResult] = await pool.query(countQuery, params);

  return {
    predios: rows,
    total: countResult[0].total,
    page: page,
    limit: limit,
    totalPages: Math.ceil(countResult[0].total / limit)
  };
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
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Formulario juliacadata</h1>
      <a href="/lista" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Ver Lista de Predios</a>
    </div>

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
         <div id="foto_status" class="mt-1 text-xs text-gray-500"></div>
       </div>
      <button class="px-3 py-1 bg-emerald-600 text-white rounded">Guardar</button>
    </form>
  </div>

<script>
// Función para comprimir y redimensionar imagen
function compressImage(file, maxWidth = 800, maxHeight = 600, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      // Calcular nuevas dimensiones manteniendo proporción
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Configurar canvas
      canvas.width = width;
      canvas.height = height;
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a base64 con compresión
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

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
  const status = document.getElementById('foto_status');
  
  // Si hay una foto existente, establecerla en el campo hidden
  if (img.src && img.src !== 'data:,' && !img.src.includes('undefined') && img.src !== window.location.href && img.src.length > 100) {
    hidden.value = img.src;
    status.textContent = 'Foto existente cargada';
    console.log('Foto existente encontrada:', img.src.substring(0, 50) + '...');
  } else {
    status.textContent = 'No hay foto registrada';
    console.log('No hay foto existente o es inválida');
  }
  
  fileInput?.addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    
    // Validar tamaño máximo (10MB)
    if (f.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB permitido.');
      fileInput.value = '';
      return;
    }
    
    try {
      status.textContent = 'Procesando imagen...';
      
      // Comprimir imagen si es muy grande
      let b64;
      if (f.size > 1024 * 1024) { // Si es mayor a 1MB
        status.textContent = 'Comprimiendo imagen grande...';
        b64 = await compressImage(f, 800, 600, 0.7);
      } else {
        b64 = await toBase64(f);
      }
      
      hidden.value = b64;
      img.src = b64;
      preview.classList.remove('hidden');
      
      const originalSize = Math.round(f.size / 1024);
      const compressedSize = Math.round(b64.length / 1024);
      const compressionRatio = originalSize > 0 ? Math.round((1 - compressedSize / originalSize) * 100) : 0;
      
      if (f.size > 1024 * 1024) {
        status.textContent = 'Imagen comprimida: ' + compressedSize + ' KB (reducida ' + compressionRatio + '%)';
      } else {
        status.textContent = 'Nueva foto cargada: ' + compressedSize + ' KB';
      }
      
      console.log('Nueva foto cargada, tamaño base64:', b64.length);
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      status.textContent = 'Error al procesar la imagen';
      alert('Error al procesar la imagen. Intente con otra foto.');
    }
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

// Función para generar números de página
function generatePageNumbers (currentPage, totalPages, searchTerm, limit) {
  const pages = [];
  const maxVisible = 5;

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  // Primera página
  if (start > 1) {
    pages.push(`<a href="/lista?${searchTerm ? 'search=' + encodeURIComponent(searchTerm) + '&' : ''}page=1&limit=${limit}" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">1</a>`);
    if (start > 2) {
      pages.push('<span class="px-2 text-gray-400">...</span>');
    }
  }

  // Páginas intermedias
  for (let i = start; i <= end; i++) {
    if (i === currentPage) {
      pages.push(`<span class="px-3 py-1 bg-blue-600 text-white border border-blue-600 rounded text-sm">${i}</span>`);
    } else {
      pages.push(`<a href="/lista?${searchTerm ? 'search=' + encodeURIComponent(searchTerm) + '&' : ''}page=${i}&limit=${limit}" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">${i}</a>`);
    }
  }

  // Última página
  if (end < totalPages) {
    if (end < totalPages - 1) {
      pages.push('<span class="px-2 text-gray-400">...</span>');
    }
    pages.push(`<a href="/lista?${searchTerm ? 'search=' + encodeURIComponent(searchTerm) + '&' : ''}page=${totalPages}&limit=${limit}" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">${totalPages}</a>`);
  }

  return pages.join('');
}

// Función para renderizar la página de lista
function renderListaPage (predios, error = "", searchTerm = "", pagination = null) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Lista de Predios - Juliaca</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
  <div class="max-w-7xl mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Lista de Predios Juliaca</h1>
             <div class="flex gap-2">
         <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Nuevo Registro</a>
         <a href="/excel${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Descargar Excel</a>
       </div>
    </div>

         ${error ? `<div class="mb-4 p-3 bg-red-100 text-red-700 rounded">${escapeHtml(error)}</div>` : ""}

           <!-- Buscador -->
      <div class="bg-white rounded-xl shadow p-4 mb-4">
        <form method="GET" action="/lista" class="flex gap-2 items-center">
          <input type="text" name="search" value="${escapeHtml(searchTerm)}" 
                 placeholder="Buscar por código, proyecto, titular o observación..." 
                 class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          <select name="limit" class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="25" ${pagination?.limit === 25 ? 'selected' : ''}>25 por página</option>
            <option value="50" ${pagination?.limit === 50 ? 'selected' : ''}>50 por página</option>
            <option value="100" ${pagination?.limit === 100 ? 'selected' : ''}>100 por página</option>
            <option value="200" ${pagination?.limit === 200 ? 'selected' : ''}>200 por página</option>
          </select>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Buscar</button>
          ${searchTerm ? `<a href="/lista" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Limpiar</a>` : ""}
        </form>
      </div>

     <div class="bg-white rounded-xl shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Código</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Proyecto</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Titular</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Estado</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Tipo</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Área (m²)</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Observación</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Foto</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${predios.map((predio, index) => {
    const hasPhoto = predio.foto_registrar && predio.foto_registrar.trim() !== "" && predio.foto_registrar !== "null";
    return `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm font-mono">${escapeHtml(predio.codigodepredio || "")}</td>
              <td class="px-4 py-3 text-sm">${escapeHtml(predio.nombredelproyecto || "")}</td>
              <td class="px-4 py-3 text-sm">${escapeHtml(predio.sujetopasivo || "")}</td>
              <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 text-xs rounded-full ${predio.estadodepago === "PAGADO" ? "bg-green-100 text-green-800" :
        predio.estadodepago === "PENDIENTE" ? "bg-yellow-100 text-yellow-800" :
          "bg-gray-100 text-gray-800"
      }">${escapeHtml(predio.estadodepago || "")}</span>
              </td>
              <td class="px-4 py-3 text-sm">${escapeHtml(predio.tipodepredio || "")}</td>
              <td class="px-4 py-3 text-sm">${escapeHtml(predio.areaenmetroscuadrados || "")}</td>
              <td class="px-4 py-3 text-sm max-w-xs truncate" title="${escapeHtml(predio.observacion || "")}">${escapeHtml(predio.observacion || "")}</td>
              <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 text-xs rounded-full ${hasPhoto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }">${hasPhoto ? "SÍ" : "NO"}</span>
              </td>
              <td class="px-4 py-3 text-sm">
                <div class="flex gap-2">
                  <a href="/?codigo=${encodeURIComponent(predio.codigodepredio)}" class="text-blue-600 hover:text-blue-800">Editar</a>
                  ${hasPhoto ? `<a href="/foto/${encodeURIComponent(predio.codigodepredio)}" class="text-green-600 hover:text-green-800">Descargar Foto</a>` : ""}
                </div>
              </td>
            </tr>`;
  }).join("")}
          </tbody>
        </table>
      </div>
             <div class="px-4 py-3 bg-gray-50 text-sm text-gray-600">
         ${searchTerm ? `Búsqueda: "${escapeHtml(searchTerm)}" - ` : ""}Mostrando ${pagination ? ((pagination.page - 1) * pagination.limit + 1) : 1} a ${pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : predios.length} de ${pagination?.total || predios.length} predios
       </div>
       
       ${pagination && pagination.totalPages > 1 ? `
       <!-- Paginación -->
       <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
         <div class="flex items-center justify-between">
           <div class="text-sm text-gray-600">
             Página ${pagination.page} de ${pagination.totalPages}
           </div>
           <div class="flex items-center gap-2">
             ${pagination.page > 1 ? `<a href="/lista?${searchTerm ? 'search=' + encodeURIComponent(searchTerm) + '&' : ''}page=${pagination.page - 1}&limit=${pagination.limit}" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">Anterior</a>` : '<span class="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-400">Anterior</span>'}
             
             ${generatePageNumbers(pagination.page, pagination.totalPages, searchTerm, pagination.limit)}
             
             ${pagination.page < pagination.totalPages ? `<a href="/lista?${searchTerm ? 'search=' + encodeURIComponent(searchTerm) + '&' : ''}page=${pagination.page + 1}&limit=${pagination.limit}" class="px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50">Siguiente</a>` : '<span class="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-400">Siguiente</span>'}
           </div>
         </div>
       </div>
       ` : ""}
         </div>
   </div>

   <script>
   // Búsqueda en tiempo real y manejo de paginación
   document.addEventListener('DOMContentLoaded', function() {
     const searchInput = document.querySelector('input[name="search"]');
     const searchForm = document.querySelector('form[action="/lista"]');
     const limitSelect = document.querySelector('select[name="limit"]');
     let searchTimeout;
     
     // Búsqueda automática después de 500ms de inactividad
     searchInput?.addEventListener('input', function() {
       clearTimeout(searchTimeout);
       searchTimeout = setTimeout(() => {
         if (this.value.trim() !== '') {
           // Resetear a página 1 cuando se busca
           const pageInput = document.createElement('input');
           pageInput.type = 'hidden';
           pageInput.name = 'page';
           pageInput.value = '1';
           searchForm.appendChild(pageInput);
           searchForm.submit();
         }
       }, 500);
     });
     
     // Cambiar límite por página
     limitSelect?.addEventListener('change', function() {
       // Resetear a página 1 cuando se cambia el límite
       const pageInput = document.createElement('input');
       pageInput.type = 'hidden';
       pageInput.name = 'page';
       pageInput.value = '1';
       searchForm.appendChild(pageInput);
       searchForm.submit();
     });
     
     // Enfoque automático en el campo de búsqueda
     searchInput?.focus();
   });
   </script>
 </body>
 </html>`;
}

// Función para generar datos de Excel (formato CSV simple)
function generateExcelData (predios) {
  const headers = [
    "Código de Predio",
    "Nombre del Proyecto",
    "Titular (Sujeto Pasivo)",
    "Estado de Pago",
    "Tipo de Predio",
    "Área (m²)",
    "Observación",
    "Tiene Foto"
  ];

  const rows = predios.map(predio => [
    predio.codigodepredio || "",
    predio.nombredelproyecto || "",
    predio.sujetopasivo || "",
    predio.estadodepago || "",
    predio.tipodepredio || "",
    predio.areaenmetroscuadrados || "",
    (predio.observacion || "").replace(/"/g, '""'), // Escapar comillas
    predio.foto_registrar && predio.foto_registrar.trim() !== "" && predio.foto_registrar !== "null" ? "SÍ" : "NO"
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\\n");

  return csvContent;
}

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

  console.log("Datos recibidos:", { codigo: code, observacion, foto_base64: foto_base64 ? "PRESENTE" : "NO PRESENTE" });

  try {
    const exists = await getByCodigo(code);
    if (exists) {
      // Si hay una nueva foto, usarla; si no, mantener la existente
      const fotoToSave = foto_base64 && foto_base64.trim() !== "" ? foto_base64 : exists.foto_registrar;
      await updateRegistro(code, observacion, fotoToSave);
      const updated = await getByCodigo(code);
      return res.send(renderPage({ codigo: code, record: updated, message: "Registro actualizado" }));
    } else {
      await insertRegistro(code, observacion, foto_base64 || null);
      const created = await getByCodigo(code);
      return res.send(renderPage({ codigo: code, record: created, message: "Registro creado" }));
    }
  } catch (e) {
    console.error("Error guardando:", e);
    res.send(renderPage({ codigo: code, error: "Error guardando: " + e.message }));
  }
});

// Ruta para lista de predios
app.get("/lista", async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const result = await getAllPredios(searchTerm, page, limit);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(renderListaPage(result.predios, "", searchTerm, result));
  } catch (e) {
    console.error("Error obteniendo lista:", e);
    res.send(renderListaPage([], "Error obteniendo lista de predios", "", { total: 0, page: 1, limit: 50, totalPages: 0 }));
  }
});

// Ruta para descargar Excel
app.get("/excel", async (req, res) => {
  try {
    const searchTerm = req.query.search || "";
    // Para Excel, obtenemos todos los resultados sin paginación
    const result = await getAllPredios(searchTerm, 1, 999999);
    const excelData = generateExcelData(result.predios);

    const filename = searchTerm ? `predios_juliaca_${searchTerm.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx` : 'predios_juliaca.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(excelData);
  } catch (e) {
    console.error("Error generando Excel:", e);
    res.status(500).send("Error generando Excel");
  }
});

// Ruta para descargar foto individual
app.get("/foto/:codigo", async (req, res) => {
  try {
    const codigo = req.params.codigo;
    const predio = await getByCodigo(codigo);

    if (!predio || !predio.foto_registrar) {
      return res.status(404).send("Foto no encontrada");
    }

    // Extraer el tipo MIME y los datos base64
    const matches = predio.foto_registrar.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).send("Formato de imagen inválido");
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename=foto_${codigo}.jpg`);
    res.send(buffer);
  } catch (e) {
    console.error("Error descargando foto:", e);
    res.status(500).send("Error descargando foto");
  }
});

app.listen(PORT, () => console.log("Servidor en http://localhost:" + PORT));
