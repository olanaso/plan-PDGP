from qgis.PyQt.QtCore import QVariant
from qgis.core import (
    QgsProject,
    QgsVectorLayer,
    QgsSpatialIndex,
    QgsField,
    QgsFeature,
    QgsGeometry
)

# Reemplaza estos con los nombres de tus capas
nombre_capa_destino = 'Destinataria'
nombre_capa_fuente = 'Fuente'

# Obtener capas
capa_destino = QgsProject.instance().mapLayersByName(nombre_capa_destino)[0]
capa_fuente = QgsProject.instance().mapLayersByName(nombre_capa_fuente)[0]

# Crear índice espacial para la capa fuente
indice_fuente = QgsSpatialIndex(capa_fuente.getFeatures())

# Crear nuevos campos en la capa destino
campos_fuente = capa_fuente.fields()

capa_destino.startEditing()
for campo in campos_fuente:
    if capa_destino.fields().indexOf(campo.name()) == -1:
        capa_destino.dataProvider().addAttributes([QgsField(campo.name(), campo.type())])
capa_destino.updateFields()

# Transferir atributos
for feat_dest in capa_destino.getFeatures():
    geom_dest = feat_dest.geometry()
    ids_posibles = indice_fuente.intersects(geom_dest.boundingBox())

    max_area = 0
    atributos_a_copiar = None

    for id in ids_posibles:
        feat_fuente = capa_fuente.getFeature(id)
        geom_fuente = feat_fuente.geometry()

        if geom_dest.intersects(geom_fuente):
            interseccion = geom_dest.intersection(geom_fuente)
            area_interseccion = interseccion.area()

            if area_interseccion > max_area:
                max_area = area_interseccion
                atributos_a_copiar = feat_fuente.attributes()

    if atributos_a_copiar:
        for i, attr in enumerate(atributos_a_copiar):
            campo_nombre = campos_fuente[i].name()
            capa_destino.changeAttributeValue(
                feat_dest.id(),
                capa_destino.fields().indexOf(campo_nombre),
                attr
            )

capa_destino.commitChanges()
print("✔️ Atributos transferidos según intersección de mayor área.")
