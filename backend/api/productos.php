<?php
require_once '../models/productos.php';
require_once '../config/databse.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$operacion = $data['operacion'];

$producto = new Producto('cotizaciones_db');

$producto->prepareData($data);

switch($operacion){
    case read:
        return $producto->read();
        break;
    case search:
        return $producto->search($data['keywords']);
        break;
    case nuevo:
        if ($producto->create())
            echo "Producto agregado";
        else
            echo "Error al ingresar registro";
        break;
    case update:
        if ($producto->update())
            echo "Producto actualizado";
        else
            echo "Error al actualizar registro";
        break;
    case eliminar:
        if ($producto->delete())
            echo "Producto eliminado";
        else
            echo "Error al eliminar registro";
        break;

}
?>