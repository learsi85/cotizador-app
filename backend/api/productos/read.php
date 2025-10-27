<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';
include_once '../../models/Producto.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $producto = new Producto($db);
    $stmt = $producto->read();
    $num = $stmt->rowCount();
    
    if($num > 0) {
        $productos_arr = array();
        $productos_arr["records"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $producto_item = array(
                "id" => $id,
                "sku" => $sku,
                "nombre" => $nombre,
                "descripcion" => $descripcion,
                "precio" => floatval($precio),
                "stock" => intval($stock),
                "proveedor" => $proveedor,
                "proveedor_id" => $proveedor_id,
                "activo" => boolval($activo)
            );
            
            array_push($productos_arr["records"], $producto_item);
        }
        
        http_response_code(200);
        echo json_encode($productos_arr);
    } else {
        http_response_code(200);
        echo json_encode(array(
            "message" => "No se encontraron productos.",
            "records" => array()
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al obtener productos.",
        "error" => $e->getMessage()
    ));
}
?>