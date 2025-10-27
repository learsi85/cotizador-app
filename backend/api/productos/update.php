<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Producto.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $producto = new Producto($db);
    
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->sku)) {
        $producto->sku = $data->sku;
        $producto->nombre = $data->nombre;
        $producto->descripcion = $data->descripcion ?? '';
        $producto->precio = $data->precio;
        $producto->proveedor_id = $data->proveedor_id ?? null;
        $producto->stock = $data->stock ?? 0;
        $producto->activo = $data->activo ?? 1;
        
        if($producto->update()) {
            http_response_code(200);
            echo json_encode(array(
                "message" => "Producto actualizado exitosamente.",
                "success" => true
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "message" => "No se pudo actualizar el producto.",
                "success" => false
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array(
            "message" => "Se requiere el SKU del producto",
            "success" => false
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al actualizar producto.",
        "error" => $e->getMessage(),
        "success" => false
    ));
}
?>