circulos_vertice : dialog {
  label = "Configuracion de circulos en vertices";
  : column {
    : edit_box {
      label = "Prefijo de etiqueta:";
      key = "prefijo";
      value = "A";
    }
    : edit_box {
      label = "Radio del círculo:";
      key = "radio";
      value = "0.2";
    }
    : popup_list {
      key = "color";
      label = "Color del circulo:";
      width = 20;
    }
    : row {
      : button {
        key = "generar";
        label = "Generar Circulo";
        is_default = true;
      }
      : button {
        key = "limpiar";
        label = "Limpiar Todo";
      }
      : button {
        key = "cancelar";
        label = "Cancelar";
        is_cancel = true;
      }
    }
  }
}
