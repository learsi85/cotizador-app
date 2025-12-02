<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Mon, 26 Jul 1997 05:00:00 GMT");
header("Content-Type: application/xml; charset=utf-8");

include_once '../../config/database.php';
include_once '../../models/Producto.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $producto = new Producto($db);
    
    // Obtener término de búsqueda
    $keywords = isset($_GET['q']) ? $_GET['q'] : '';
    
    if(empty($keywords)) {
        if(isset($_GET['sku'])){
            $producto->sku = $_GET['sku'];

            if($producto->readOne()) {
                http_response_code(200);
                echo json_encode(array(
                    "id" => $producto->id,
                    "sku" => $producto->sku,
                    "nombre" => $producto->nombre,
                    "descripcion" => $producto->descripcion,
                    "precio" => floatval($producto->precio),
                    "stock" => intval($producto->stock),
                    "proveedor_id" => $producto->proveedor_id
                ));
            } else {
                http_response_code(404);
                echo json_encode(array("message" => "Producto no encontrado"));
            }
            exit;
        }
        http_response_code(400);
        echo json_encode(array("message" => "Se requiere un término de búsqueda"));
        exit;
    }
    
    $stmt = $producto->search($keywords);
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
                "proveedor_id" => $proveedor_id
            );
            
            array_push($productos_arr["records"], $producto_item);
        }
        
        http_response_code(200);
        echo json_encode($productos_arr);
    } else {
        http_response_code(200);
        echo json_encode(array(
            "message" => "No se encontraron productos con ese término.",
            "records" => array()
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error en la búsqueda.",
        "error" => $e->getMessage()
    ));
}
?>