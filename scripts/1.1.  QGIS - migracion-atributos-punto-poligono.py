from qgis.PyQt.QtCore import QVariant
from qgis.core import (
    QgsProject, QgsVectorLayer, QgsSpatialIndex, QgsField, QgsFeature, QgsGeometry
)

# Reemplaza estos con los nombres exactos de tus capas
nombre_capa_poligonos = 'trujillo_poli'  # Capa destino
nombre_capa_puntos = 'trujillo'               # Capa fuente

# Cargar capas
capa_poligonos = QgsProject.instance().mapLayersByName(nombre_capa_poligonos)[0]
capa_puntos = QgsProject.instance().mapLayersByName(nombre_capa_puntos)[0]

# Validar que tengan el mismo sistema de referencia (CRS)
if capa_poligonos.crs() != capa_puntos.crs():
    print("❌ Las capas no tienen el mismo CRS.")
else:
    print("✅ CRS compatibles.")

# Crear índice espacial para la capa de puntos
indice_espacial_puntos = QgsSpatialIndex(capa_puntos.getFeatures())

# Agregar campos de la capa de puntos a la capa de polígonos (si no existen)
campos_puntos = capa_puntos.fields()
capa_poligonos.startEditing()
for campo in campos_puntos:
    if capa_poligonos.fields().indexOf(campo.name()) == -1:
        capa_poligonos.dataProvider().addAttributes([QgsField(campo.name(), campo.type())])
capa_poligonos.updateFields()

# Transferir atributos de los puntos a los polígonos que los contienen
for poligono in capa_poligonos.getFeatures():
    geom_poligono = poligono.geometry()
    if not geom_poligono or geom_poligono.isEmpty():
        continue

    ids_posibles_puntos = indice_espacial_puntos.intersects(geom_poligono.boundingBox())
    punto_encontrado = None

    for id_punto in ids_posibles_puntos:
        punto = capa_puntos.getFeature(id_punto)
        geom_punto = punto.geometry()

        if geom_poligono.intersects(geom_punto):  # Usa intersects para mayor tolerancia
            punto_encontrado = punto
            break

    if punto_encontrado:
        atributos = poligono.attributes()
        for i, valor_attr in enumerate(punto_encontrado.attributes()):
            nombre_campo = campos_puntos[i].name()
            index = capa_poligonos.fields().indexOf(nombre_campo)
            if index != -1:
                atributos[index] = valor_attr
        poligono.setAttributes(atributos)
        capa_poligonos.updateFeature(poligono)

# Guardar los cambios
capa_poligonos.commitChanges()
print("✔️ Atributos de puntos transferidos a los polígonos que los contienen.")
