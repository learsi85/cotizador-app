<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Producto.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $producto = new Producto($db);
    
    // Obtener datos del POST
    $data = json_decode(file_get_contents("php://input"));
    
    // Validar datos requeridos
    if(
        !empty($data->sku) &&
        !empty($data->nombre) &&
        !empty($data->precio)
    ) { 
        $producto->sku = $data->sku;
        $producto->nombre = $data->nombre;
        $producto->descripcion = $data->descripcion;
        $producto->precio = $data->precio;
        $producto->proveedor_id = $data->proveedor_id;
        $producto->stock = $data->stock ?? 0;
        
        if($producto->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Producto creado exitosamente.",
                "success" => true
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "message" => "No se pudo crear el producto.",
                "success" => false
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array(
            "message" => "Datos incompletos. Se requiere: sku, nombre, precio",
            "success" => false
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al crear producto.",
        "error" => $e->getMessage(),
        "success" => false
    ));
}
?>