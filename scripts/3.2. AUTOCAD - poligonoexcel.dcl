excelpoly : dialog {
  label = "Generar Polígonos desde Excel";
  : row {
    : text {
      label = "Carpeta:";
    }
    : edit_box {
      key = "ruta";
      width = 40;
    }
    : button {
      key = "examinar";
      label = "...";
    }
  }
  spacer;
  : button {
    key = "aceptar";
    label = "Generar Poligonos";
    is_default = true;
  }
  : button {
    key = "cancelar";
    label = "Cancelar";
    is_cancel = true;
  }
}
