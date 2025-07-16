(defun c:CopiarPoligonosPorTexto ( / lista capaDestino selText nText selPoly nPoly i objTexto texto textoPos j polyObj polyFound isClosed pointInside newPoly copyText newText )
  ;; 1. Lista de textos a buscar:
  (setq lista
    (list
      "AERO-JAUJA-SO2-120401-PR-00488"
      "AERO-JAUJA-PR-0218"
      "AERO-JAUJA-SO3-120404-PR-00499"
      "AERO-JAUJA-SO3-120401-PR-00221A"
      "AERO-JAUJA-SO3-120401-PR-00221"
      "AERO-JAUJA-PR-329A"
      "AERO-JAUJA-PR-0329"
      "AERO-JAUJA-PR-00514"
      "AERO-JAUJA-SO3-120401-PR-00150"
      "AERO-JAUJA-SO2-120401-PR-0486A"
      "AERO-JAUJA-S03-120404-PR-00337"
      "AERO-JAUJA-PR-0522T"
      "AERO-JAUJA-SO2-120401-PR-00266-B"
      "AERO-JAUJA-SO3-120401-PR-00224"
      "AERO-JAUJA-PR-0203"
      "AERO-JAUJA-SO1-120401-PU-0009"
      "AERO-JAUJA-SO3-120401-PR-0216A"
      "AERO-JAUJA-SO2-120401-PR-00313"
      "AERO-JAUJA-SO3-120404-PR-00498"
      "AERO-JAUJA-S03-120404-PR-00350"
      "AERO-JAUJA-PR-0406"
      "AERO-JAUJA-SO2-120410-PR-00098"
      "AERO-JAUJA-SO2-120401-PR-00278"
      "AERO-JAUJA-SO1-120401-PU-00381"
      "AERO-JAUJA-SO3-120410-PR-00118"
      "AERO-JAUJA-SO2-120401-PR-00297A"
      "AERO-JAUJA-PR-0056"
      "AERO-JAUJA-PR-0056A"
      "AERO-JAUJA-SO2-120401-PR-00271"
      "AERO-JAUJA-PR-0147"
      "AERO-JAUJA-SO1-120401-PU-00021"
      "AERO-JAUJA-SO2-120401-PR-00476"
      "AERO-JAUJA-SO1-120401-PU-00388"
      "AERO-JAUJA-PU-0382"
      "AERO-JAUJA-SO3-120404-PR-0502"
      "AERO-JAUJA-SO3-120404-PR-00353"
      "AERO-JAUJA-SO3-120404-PR-00335"
      "AERO-JAUJA-SO3-120401-PR-00194"
      "AERO-JAUJA-SO3-120401-PR-00226"
      "AERO-JAUJA-SO3-120401-PR-0226A"
      "AERO-JAUJA-SO3-120401-PR-00162"
      "AERO-JAUJA-SO2-120401-PR-00291"
      "AERO-JAUJA-PR-0234A"
      "AERO-JAUJA-SO3-120401-PR-00504"
      "AERO-JAUJA-PR-0272"
      "AERO-JAUJA-SO3-120401-PR-0228A"
      "AERO-JAUJA-SO2-120401-PR-00281"
      "AERO-JAUJA-PR-0215"
      "AERO-JAUJA-SO1-120401-PU-0009B"
      "AERO-JAUJA-S03-120404-PR-00460"
      "AERO-JAUJA-PR-0059A"
      "AERO-JAUJA-PR-300A"
      "AERO-JAUJA-PR-0526T"
      "AERO-JAUJA-S02-120410-PR-00286"
      "AERO-JAUJA-SO1-120401-PU-00386"
      "AERO-JAUJA-SO2-120401-PR-00084"
      "AERO-JAUJA-PR-0148"
      "AERO-JAUJA-PU-005A"
      "AERO-JAUJA-SO2-120401-PR-00275"
      "AERO-JAUJA-S01-120410-PU-00014"
      "AERO-JAUJA-PR-0528T"
      "AERO-JAUJA-SO2-120401-PR-00266-D"
      "AERO-JAUJA-SO2-120401-PR-00268"
      "AERO-JAUJA-PU-00516"
      "AERO-JAUJA-PR-0520T"
      "AERO-JAUJA-S02-120410-PR-00436"
      "AERO-JAUJA-S02-120410-PR-00287"
      "AERO-JAUJA-SO2-120401-PR-00433"
      "AERO-JAUJA-PR-0075"
      "AERO-JAUJA-SO3-120401-PR-00217B"
      "AERO-JAUJA-SO3-120401-PR-00217A"
      "AERO-JAUJA-SO3-120401-PR-00217"
      "AERO-JAUJA-SO2-120401-PR-00312"
      "AERO-JAUJA-PR-0529T"
      "AERO-JAUJA-SO2-120401-PR-00437"
      "AERO-JAUJA-PR-0145"
      "AERO-JAUJA-SO3-120401-PR-00201"
      "AERO-JAUJA-SO1-120401-PR-00345"
      "AERO-JAUJAPR-0180"
      "AERO-JAUJA-SO3-120404-PR-00179"
      "AERO-JAUJA-SO3-120401-PR-0227A"
      "AERO-JAUJA-SO3-120401-PR-00227"
      "AERO-JAUJA-SO3-120404-PR-0501"
      "AERO-JAUJA-S02-120410-PR-00325"
      "AERO-JAUJA-SO1-120401-PU-0009A"
      "AERO-JAUJA-SO1-120401-PU-00389"
      "AERO-JAUJA-S03-120410-PR-00177"
      "AERO-JAUJA-PR-0095"
      "AERO-JAUJA-SO2-120401-PR-00477"
      "AERO-JAUJA-SO1-120401-PR-0510A"
      "AERO-JAUJA-SO1-120401-PU-00011"
      "AERO-JAUJA-SO2-120410-PR-00090"
      "AERO-JAUJA-PU-0050"
      "AERO-JAUJA-SO1-120401-PU-00005"
      "AERO-JAUJA-SO3-120401-PR-00199"
      "AERO-JAUJA-SO3-120401-PR-0220A"
      "AERO-JAUJA-SO2-120401-PR-00431"
      "AERO-JAUJA-SO3-120404-PR-00361"
      "AERO-JAUJA-PR-0074"
      "AERO-JAUJA-PR-0231"
      "AERO-JAUJA-PR-0521T"
      "AERO-JAUJA-SO3-120404-PR-00182"
      "AERO-JAUJA-SO2-120410-PR-0099A"
      "AERO-JAUJA-SO1-120410-PR-00306"
      "AERO-JAUJA-SO2-120401-PR-00288"
      "AERO-JAUJA-SO2-120401-PR-00261"
      "AERO-JAUJA-SO1-120410-PR-00073"
      "AERO-JAUJA-SO3-120401-PR-00210"
      "AERO-JAUJA-PR-0105"
      "AERO-JAUJA-SO2-120401-PR-00085"
      "AERO-JAUJA-SO2-120401-PR-00473"
      "AERO-JAUJA-SO3-120410-PR-00119"
      "AERO-JAUJA-SO3-120401-PR-00225"
      "AERO-JAUJA-SO3-120401-PR-0225A"
      "AERO-JAUJA-S01-120401-PR-00380"
      "AERO-JAUJA-PR-0523T"
      "AERO-JAUJA-PR-0198"
      "AERO-JAUJA-SO3-120404-PR-0343"
      "AERO-JAUJA-PR-0134A"
      "AERO-JAUJA-SO2-120410-PR-00091"
      "AERO-JAUJA-PR-0115B"
      "AERO-JAUJA-SO2-120401-PR-00292"
      "AERO-JAUJA-SO1-120401-PU-00387"
      "AERO-JAUJA-PR-0057A"
      "AERO-JAUJA-PR-0057"
      "AERO-JAUJA-SO2-120401-PR-00262"
      "AERO-JAUJA-SO1-120401-PR-00039"
      "AERO-JAUJA-SO3-120401-PR-00138"
    )
  )

  ;; 2. Pedir el nombre de la capa destino:
  (setq capaDestino (getstring T "\nNombre de la capa destino: "))
  (if (not (tblsearch "layer" capaDestino))
    (command "._LAYER" "M" capaDestino "")
  )

  ;; 3. Preguntar si también quiere copiar el texto:
  (initget "Si No")
  (setq copyText (getkword "\n¿Copiar también el texto? [Si/No] <No>: "))
  (if (null copyText) (setq copyText "No"))

  ;; 4. Seleccionar todos los textos
  (setq selText (ssget "X" '((0 . "TEXT,MTEXT"))))
  (setq selPoly (ssget "X" '((0 . "LWPOLYLINE")(70 . 1)))) ; Solo polilíneas cerradas

  (if (and selText selPoly)
    (progn
      (setq nText (sslength selText))
      (setq nPoly (sslength selPoly))
      (setq i 0)
      (while (< i nText)
        (setq objTexto (vlax-ename->vla-object (ssname selText i)))
        (setq texto (vla-get-textstring objTexto))
        ;; ¿El texto está en la lista?
        (if (member texto lista)
          (progn
            (setq textoPos (vlax-get objTexto 'InsertionPoint))
            ;; Buscar polilínea que lo contenga
            (setq j 0 polyFound nil)
            (while (and (< j nPoly) (not polyFound))
              (setq polyObj (vlax-ename->vla-object (ssname selPoly j)))
              (setq isClosed (vla-get-closed polyObj))
              (if (= isClosed :vlax-true)
                (progn
                  (setq pointInside (vlax-invoke polyObj 'IsPointInside textoPos acExtendNone))
                  (if (= pointInside :vlax-true)
                    (setq polyFound polyObj)
                  )
                )
              )
              (setq j (1+ j))
            )
            (if polyFound
              (progn
                (setq newPoly (vla-copy polyFound))
                (vla-put-layer newPoly capaDestino)
                (if (equal copyText "Si")
                  (progn
                    (setq newText (vla-copy objTexto))
                    (vla-put-layer newText capaDestino)
                  )
                )
              )
            )
          )
        )
        (setq i (1+ i))
      )
      (princ "\nListo.")
    )
    (princ "\nNo se encontraron textos o polilíneas cerradas.")
  )
  (princ)
)
