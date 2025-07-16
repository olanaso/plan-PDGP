(defun c:POLIGONOEXCELUI ( / dcl_id ruta archivos ok fullpath )
  (alert "Iniciando rutina POLIGONOEXCELUI")

  ;; Cargar DCL
  (setq dcl_id (load_dialog "C:/Users/Gamers/Desktop/Cajamarca/migracion/scripts/lisp/poligonoexcel.dcl"))
  (if (not (new_dialog "excelpoly" dcl_id))
    (progn
      (alert "Error: No se pudo cargar el diálogo.")
      (exit)
    )
  )

  ;; Acción del botón examinar
  (action_tile "examinar"
    "(setq ruta (getfolder \"Seleccione la carpeta con archivos Excel\")) (set_tile \"ruta\" ruta)"
  )

  ;; Acción del botón aceptar
  (action_tile "aceptar"
    "(setq ruta (get_tile \"ruta\")) (done_dialog 1)"
  )

  ;; Acción del botón cancelar
  (action_tile "cancelar" "(done_dialog 0)")

  ;; Ejecutar diálogo
  (setq ok (start_dialog))
  (unload_dialog dcl_id)

  ;; Procesar si se presionó aceptar
  (if (= ok 1)
    (progn
      (setq archivos (vl-directory-files ruta "*.xls*"))
      (foreach archivo archivos
        (setq fullpath (strcat ruta "\\" archivo))
        (if (leer-y-dibujar-poligono fullpath)
          (princ (strcat "\n✔ Polígono generado: " archivo))
          (princ (strcat "\n✖ Error en archivo: " archivo))
        )
      )
    )
  )

  (princ)
)

;; Función auxiliar para obtener valor seguro de celda
(defun getCellSafe (sheet row col / cell val)
  (setq cell (vl-catch-all-apply (function (lambda () (vlax-invoke-method sheet 'Cells row col))) '()))
  (if (vl-catch-all-error-p cell)
    nil
    (setq val (vl-catch-all-apply (function (lambda () (vlax-get-property cell 'Value2))) '()))
  )
  (if (vl-catch-all-error-p val)
    nil
    val
  )
)



(defun leer-y-dibujar-poligono (filepath / excel wb ws lista-coord i rawX rawY valX valY valVertice nombre sumaX sumaY centro ent max-filas puntos sheets total hoja celda valor texto j)
  (setq nombre (vl-filename-base filepath))
  (setq lista-coord '())
  (setq i 2)
  (setq max-filas 20)

  ;; Abrir Excel
  (setq excel (vlax-get-or-create-object "Excel.Application"))
  (vlax-put-property excel 'Visible :vlax-false)

  (setq wb (vlax-invoke-method (vlax-get-property excel 'Workbooks) 'Open filepath))
  (setq sheets (vlax-get-property wb 'Sheets))
  (setq total (vlax-get-property sheets 'Count))
  (alert (strcat "Total hojas: " (itoa total)))

  ;; Mostrar nombres de todas las hojas en consola
  (setq i 1)
  (while (<= i total)
    (setq hoja (vlax-get-property sheets 'Item i))
    (princ (strcat "\nHoja " (itoa i) ": " (vl-princ-to-string (vlax-get-property hoja 'Name))))
    (setq i (1+ i))
  )

  ;; Leer desde la primera hoja (no usar ActiveSheet)
  (setq ws (vlax-get-property sheets 'Item 1))

  ;; Diagnóstico: mostrar contenido filas 1-10 y columnas 1-6
  (princ "\nContenido de las primeras filas:")
  (setq i 1)
  (while (<= i 10)
    (setq j 1)
    (while (<= j 6)
      (setq celda (vl-catch-all-apply
                    (function (lambda ()
                      (vlax-invoke-method ws 'Cells i j))) '()))
      (setq valor (if (vl-catch-all-error-p celda) nil
                    (vl-catch-all-apply (function (lambda () (vlax-get-property celda 'Value2))) '())))
      (setq texto (vl-princ-to-string valor))
      (princ (strcat "\n[Fila " (itoa i) ", Col " (itoa j) "] => " texto))
      (setq j (1+ j))
    )
    (setq i (1+ i))
  )

  ;; Cerrar Excel
  (vlax-invoke-method wb 'Close :vlax-false)
  (vlax-release-object ws)
  (vlax-release-object wb)
  (vlax-release-object excel)

  (princ "\nFIN DE LECTURA DE EXCEL (Diagnóstico).")
  (princ)
)



;; Función principal: leer Excel y dibujar polígono
(defun leer-y-dibujar-poligono2 (filepath / excel wb ws lista-coord i rawX rawY valX valY valVertice nombre sumaX sumaY centro ent max-filas puntos sheets total)
  (setq nombre (vl-filename-base filepath))
  (setq lista-coord '())
  (setq i 2)
  (setq max-filas 20)

  ;; Abrir Excel
   ;; Crear instancia de Excel
  (setq excel (vlax-get-or-create-object "Excel.Application"))
  (vlax-put-property excel 'Visible :vlax-false) ; No mostrar Excel

 ;(setq wb (vlax-invoke-method (vlax-get-property excel 'Workbooks) 'Open filepath))
  ;(setq ws (vlax-get-property (vlax-get-property wb 'Sheets) 'Item 1))
  

  (setq wb (vlax-invoke-method (vlax-get-property (vlax-get-property excel 'Workbooks) 'Application)
                               'Open filepath))
							   
							   
     ;; Obtener todas las hojas del libro
  (setq sheets (vlax-get-property wb 'Sheets))
  (setq total (vlax-get-property sheets 'Count))
  (alert (strcat "✅ Total de hojas en el archivo: " (itoa total)))

  ;; Acceder a la primera hoja de forma segura y activarla
  (setq hoja (vlax-get-property sheets 'Item 1))
  (vlax-invoke-method hoja 'Activate)

  ;; Establecer como hoja activa de trabajo
  (setq ws hoja) ; ← ahora puedes usar 'ws' normalmente
  ;(setq ws (vlax-get-property (vlax-get-property wb 'Sheets) 'Item 1))
  ;(setq ws (vlax-get-property wb 'ActiveSheet))
  
  (setq sheets (vlax-get-property wb 'Sheets))
  (setq total (vlax-get-property sheets 'Count))
  (alert (strcat "Total hojas: " (itoa total)))


  ;; Leer filas
(setq i 2) ; Comenzar desde la segunda fila (asumiendo encabezados en la primera)
(setq lista-coord '())

(while T
  ;; Leer columna Vértice, Este (X), Norte (Y)
    
				 
				 
	(setq valVertice (getCellSafe ws i 1))
	(setq rawX (getCellSafe ws i 4))
	(setq rawY (getCellSafe ws i 5))

	(alert (strcat "Fila " (itoa i)
	"\nVértice: " (vl-princ-to-string valVertice)
	"\nX (raw): " (vl-princ-to-string rawX)
	"\nY (raw): " (vl-princ-to-string rawY)))
				 
  ;; Validar que el vértice NO esté vacío o en blanco
  (if (or (null valVertice)
          (eq (type valVertice) 'STR) (wcmatch (strcase valVertice) " *") ; vacíos o espacios
      )
    (progn
      (princ (strcat "\n[Fila " (itoa i) "] Fin de lectura por Vértice vacío."))
      (setq i nil) ; Finaliza el ciclo
    )
    (progn
      ;; Convertir X y Y a número si es necesario
      (setq valX (if (numberp rawX) rawX (atof (vl-princ-to-string rawX))))
      (setq valY (if (numberp rawY) rawY (atof (vl-princ-to-string rawY))))

      ;; Si son válidos, agregar a lista
      (if (and (numberp valX) (numberp valY))
        (progn
          (princ (strcat "\n[Fila " (itoa i) "] Vértice: " (vl-princ-to-string valVertice)
                         " | X: " (rtos valX 2 3) ", Y: " (rtos valY 2 3)))
          (setq lista-coord (append lista-coord (list (list valVertice valX valY))))
        )
        ;; En caso de error en coordenadas
        (princ (strcat "\n[Error] Fila " (itoa i) " contiene X o Y no válidos"))
      )
      (setq i (+ i 1)) ; Avanzar a la siguiente fila
    )
  )
)



  ;; Cerrar Excel
  (vlax-invoke-method wb 'Close :vlax-false)
  (vlax-release-object ws)
  (vlax-release-object wb)
  (vlax-release-object excel)

  ;; Ordenar por vértice
  (setq lista-coord (vl-sort lista-coord (function (lambda (a b) (< (car a) (car b))))))
  
  ;; Mostrar todos los puntos en consola
(princ (strcat "\nLista de puntos para archivo: " nombre))
(foreach pt lista-coord
  (princ (strcat
    "\nVértice " (itoa (fix (car pt)))
    " => X: " (rtos (cadr pt) 2 3)
    ", Y: " (rtos (caddr pt) 2 3)
  ))
)

  ;; Validar
  (if (< (length lista-coord) 3)
    (progn
      (alert (strcat "Error: Menos de 3 puntos válidos en " nombre))
      nil
    )
    (progn
      ;; Crear puntos para polígono
      (setq puntos (mapcar (function (lambda (item) (list (cadr item) (caddr item)))) lista-coord))

      ;; Crear polilínea cerrada
      (setq ent (entmakex
        (append
          (list
            (cons 0 "LWPOLYLINE")
            (cons 100 "AcDbEntity")
            (cons 100 "AcDbPolyline")
            (cons 90 (length puntos))
            (cons 70 1) ; cerrado
          )
          (mapcar (function (lambda (pt) (cons 10 pt))) puntos)
        )
      ))

      ;; Calcular centroide
      (setq sumaX 0.0 sumaY 0.0)
      (foreach pt puntos
        (setq sumaX (+ sumaX (car pt)))
        (setq sumaY (+ sumaY (cadr pt)))
      )
      (setq centro (list (/ sumaX (length puntos)) (/ sumaY (length puntos))))

      ;; Insertar etiqueta
      (entmakex (list
        (cons 0 "TEXT")
        (cons 10 centro)
        (cons 40 2.5)
        (cons 1 nombre)
        (cons 7 "Standard")
        (cons 72 1)
        (cons 73 2)
      ))
      t
    )
  )
)

;; Selector de carpetas
(defun getfolder (msg / sh folder)
  (setq sh (vlax-create-object "Shell.Application"))
  (setq folder (vlax-invoke-method sh 'BrowseForFolder 0 msg 0))
  (if folder
    (vlax-get-property (vlax-get-property folder 'Self) 'Path)
  )
)
