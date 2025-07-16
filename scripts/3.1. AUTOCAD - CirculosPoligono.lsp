
(defun c:VERTCIR ()
  (defun listar-vertices (ent)
    (mapcar 'cdr (vl-remove-if-not '(lambda (x) (= (car x) 10)) (entget ent)))
  )

  (defun punto-cercano (pt lista)
    (car (vl-sort lista '(lambda (a b) (< (distance pt a) (distance pt b)))))
  )

  (defun recortar-desde (n lst)
    (if (<= n 0)
      lst
      (recortar-desde (1- n) (cdr lst))
    )
  )

  (setq dcl_id (load_dialog "C:/Users/Gamers/Desktop/Cajamarca/migracion/scripts/lisp/PoligonoExcelAutoCAD/CirculosPoligonos.dcl"))
  (if (not (new_dialog "circulos_vertice" dcl_id)) (exit))

  ;; Colores básicos
  (setq colores '("ByLayer" "1-Rojo" "2-Amarillo" "3-Verde" "4-Cian" "5-Azul" "6-Magenta"))
  (start_list "color")
  (mapcar 'add_list colores)
  (end_list)

  ;; Variables por defecto
  (setq user_radio "0.2")
  (setq user_prefijo "A")
  (setq user_color_index 0)
  (setq limpiar nil)

  (action_tile "prefijo" "(setq user_prefijo $value)")
  (action_tile "radio" "(setq user_radio $value)")
  (action_tile "color" "(setq user_color_index (atoi $value))")
  (action_tile "generar" "(setq modo 'generar)(done_dialog 1)")
  (action_tile "limpiar" "(setq modo 'limpiar)(done_dialog 1)")
  (action_tile "cancelar" "(setq modo 'cancelar)(done_dialog 0)")

  (setq respuesta (start_dialog))
  (unload_dialog dcl_id)

  (cond
    ((eq modo 'generar)
      (setq radio (atof user_radio))
      (if (<= radio 0) (setq radio 0.2))
      (if (null user_prefijo) (setq user_prefijo ""))

      (prompt "\nSeleccione una polilínea...")
      (setq sel (entsel))
      (if sel
        (progn
          (setq ent (car sel))
          (setq vertices (listar-vertices ent))
          (prompt "\nSeleccione el vértice de inicio...")
          (setq pto (getpoint "\nHaga clic en el vértice de inicio: "))
          (setq primero (punto-cercano pto vertices))
          (setq pos (vl-position primero vertices))
          (setq lista1 (recortar-desde pos vertices))
          (setq lista2 (reverse (recortar-desde (- (length vertices) pos) (reverse vertices))))
          (setq orden (append lista1 lista2))

          (command "_.-LAYER" "M" "VERTICES" "")
          (setq idx 1)
          (foreach pt orden
            (command "_.CIRCLE" pt radio)
            (command "_.CHPROP" "L" "" "C" (itoa user_color_index) "")
            (if (/= user_prefijo "")
              (progn
                (command "_.TEXT" "_M" pt (* radio 1.5) 0 (strcat user_prefijo (itoa idx)))
                (command "_.CHPROP" "L" "" "C" (itoa user_color_index) "")
              )
            )
            (setq idx (1+ idx))
          )
        )
        (prompt "\nNo se seleccionó ninguna polilínea.")
      )
    )
    ((eq modo 'limpiar)
      (prompt "\nEliminando círculos y textos generados...")
      (setq ss (ssget "_X" '((0 . "CIRCLE,TEXT") (8 . "VERTICES"))))
      (if ss (command "_.ERASE" ss ""))
    )
  )
  (princ)
)
