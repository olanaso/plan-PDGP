CAD2GIS – Migración de Aeropuertos DDP
Repositorio que centraliza el proceso de migración de información de formatos CAD a entornos GIS para los proyectos aeroportuarios de la Dirección de Desarrollo de Proyectos (DDP).
Incluye scripts, plantillas y datos auxiliares utilizados para convertir, validar y documentar la información catastral y registral.

Objetivos
Estandarizar la conversión de capas CAD a formatos GIS.

Automatizar tareas repetitivas mediante scripts en QGIS, AutoCAD, Excel y PowerShell.

Resguardar los insumos, resultados y documentación generada durante la migración.

Facilitar la trazabilidad del proceso mediante una estructura de carpetas coherente.

Estructura del repositorio
Carpeta	Descripción
archivos-originales/	Planos y archivos CAD recibidos para cada aeropuerto (Cajamarca, Jauja, Pucallpa, Trujillo, etc.).
archivos-convertidos/	Capas transformadas a formatos GIS (Shapefile, GeoPackage, etc.) por aeropuerto.
capas-gis/	Capas geográficas y scripts SQL para cargar información en bases de datos (ej. Cajamarca/data-script.sql).
scripts/	Herramientas de apoyo:
• QGIS (*.py) para migración de atributos.
• AutoCAD (*.lsp, *.dcl).
• Macros de Excel (*.txt).
• PowerShell (*.ps1).
docs/	Documentación de soporte: manuales de usuario, diccionario de datos, formatos de carga, etc.
templatesdocumentos/	Plantillas de oficios y anexos utilizados en procesos de transferencia, inmatriculación, etc.
visor/	Prototipos de visualización (web y PowerBI) para explorar la información migrada.
recursos/	Otros recursos de planificación (por ejemplo, cronogramas de proyecto).
Requisitos
Dependiendo de la herramienta a utilizar, pueden ser necesarios:

QGIS 3.x con PyQGIS habilitado.

AutoCAD con soporte para scripts LISP/DCL.

Microsoft Excel (para macros).

PowerShell (Windows) para automatizaciones de archivos.

Acceso a las capas y archivos CAD/GIS correspondientes.

Uso básico
Preparación de datos

Coloque los planos CAD originales en archivos-originales/<Aeropuerto>/.

Ejecute las macros de Excel o scripts de PowerShell para normalizar nombres y campos si es necesario.

Conversión CAD → GIS

Utilice los scripts de AutoCAD (scripts/*.lsp) para exportar geometrías.

Importe el resultado en QGIS y aplique los scripts de migración (scripts/*.py) para transferir atributos o convertir geometrías.

Validación y carga

Guarde los resultados en archivos-convertidos/<Aeropuerto>/.

Si corresponde, ejecute los scripts SQL de capas-gis/ para almacenar la información en la base de datos.

Documentación

Registre observaciones y documentos de respaldo en docs/.

Emplee las plantillas de templatesdocumentos/ para emitir oficios o anexos formales.

Contribuciones
Hacer un fork del repositorio.

Trabajar sobre una rama descriptiva.

Documentar los cambios y enviar un pull request detallando:

Descripción del problema y solución.

Pasos para reproducir/validar.

Alinear el código con la estructura y estilo existentes.

Licencia
Este repositorio se entrega “tal cual” para uso interno. En caso de requerir una licencia explícita, incluirla en esta sección según las directrices de la organización.

Contacto
Para dudas o mejoras, contacte con el equipo responsable del proyecto CAD2GIS – DDP.
