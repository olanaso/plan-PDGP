(defun dist-pt-to-seg (pt1 pt2 p)
  (defun v- (a b) (mapcar '- a b))
  (defun v+ (a b) (mapcar '+ a b))
  (defun v* (s a) (mapcar '(lambda (x) (* s x)) a))
  (defun dot (a b) (apply '+ (mapcar '* a b)))
  (let* (
      (v (v- pt2 pt1))
      (w (v- p pt1))
      (c1 (dot w v))
      (c2 (dot v v))
    )
    (if (<= c2 1e-8)
      (distance pt1 p)
      (let* (
          (b (/ c1 c2))
          (pb (if (< b 0.0) pt1 (if (> b 1.0) pt2 (v+ pt1 (v* b v)))))
        )
        (distance p pb)
      )
    )
  )
)

;; Algoritmo clásico punto en polígono para polilínea cerrada
(defun point-in-poly (pt coords)
  (setq cnt 0
        n   (/ (length coords) 2)
        x   (car pt)
        y   (cadr pt)
        i   0
        j   (- n 1)
  )
  (while (< i n)
    (setq xi (nth (* i 2) coords)
          yi (nth (+ 1 (* i 2)) coords)
          xj (nth (* j 2) coords)
          yj (nth (+ 1 (* j 2)) coords)
    )
    (if (and (/= yi yj)
             (or (and (> y yi) (<= y yj))
                 (and (> y yj) (<= y yi))))
      (progn
        (setq cross (+ xi (/ (* (- y yi) (- xj xi)) (- yj yi))))
        (if (< x cross) (setq cnt (1+ cnt)))
      )
    )
    (setq j i)
    (setq i (1+ i))
  )
  (= (rem cnt 2) 1)
)

(defun c:SeleccionarPolilineasPorTexto ( / lista dentroDist selText nText selPoly nPoly i objTexto texto textoPos j polyObj polyEname coords nVerts k pt1 pt2 minDist isClosed ssPolysFound )
  ;; REEMPLAZA LA LISTA por la tuya completa:
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
  (setq dentroDist 1.0) ; distancia de cercanía para polilínea abierta (ajustar)
  (setq selText (ssget "X" '((0 . "TEXT,MTEXT"))))
  (setq selPoly (ssget "X" '((0 . "LWPOLYLINE"))))
  (setq ssPolysFound (ssadd))
  (if (and selText selPoly)
    (progn
      (setq nText (sslength selText))
      (setq nPoly (sslength selPoly))
      (setq i 0)
      (while (< i nText)
        (setq objTexto (vlax-ename->vla-object (ssname selText i)))
        (setq texto (vla-get-textstring objTexto))
        (if (member texto lista)
          (progn
            (setq textoPos (vlax-get objTexto 'InsertionPoint))
            (setq j 0)
            (while (< j nPoly)
              (setq polyEname (ssname selPoly j))
              (setq polyObj (vlax-ename->vla-object polyEname))
              (setq isClosed (vla-get-closed polyObj))
              (setq coords (vlax-get polyObj 'Coordinates))
              (if (= isClosed :vlax-true)
                (if (point-in-poly textoPos coords)
                  (ssadd polyEname ssPolysFound)
                )
                (progn
                  (setq nVerts (/ (length coords) 2))
                  (setq k 0)
                  (setq minDist 1e99)
                  (while (< k (- nVerts 1))
                    (setq pt1 (list (nth (* k 2) coords) (nth (+ 1 (* k 2)) coords)))
                    (setq pt2 (list (nth (* (+ k 1) 2) coords) (nth (+ 1 (* (+ k 1) 2)) coords)))
                    (setq dist (dist-pt-to-seg pt1 pt2 textoPos))
                    (if (< dist minDist) (setq minDist dist))
                    (setq k (1+ k))
                  )
                  (if (< minDist dentroDist)
                    (ssadd polyEname ssPolysFound)
                  )
                )
              )
              (setq j (1+ j))
            )
          )
        )
        (setq i (1+ i))
      )
      ;; Seleccionar resultado en pantalla
      (if (> (sslength ssPolysFound) 0)
        (progn
          (sssetfirst nil ssPolysFound)
          (princ (strcat "\nPolilíneas encontradas y seleccionadas: " (itoa (sslength ssPolysFound))))
        )
        (princ "\nNo se encontró ninguna polilínea con textos de la lista.")
      )
    )
    (princ "\nNo se encontraron textos o polilíneas.")
  )
  (princ)
)
