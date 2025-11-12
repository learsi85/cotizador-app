<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Cotizacion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $cotizacion = new Cotizacion($db);
    
    $data = json_decode(file_get_contents("php://input"));
     
    // Validar datos requeridos
    if(
        !empty($data->cliente_nombre) &&
        !empty($data->items) &&
        is_array($data->items) &&
        count($data->items) > 0
    ) {
        
        $cotizacion->cliente_id = $data->cliente_id ?? null;
        $cotizacion->cliente_nombre = $data->cliente_nombre;
        $cotizacion->fecha = $data->fecha ?? date('Y-m-d');
        $cotizacion->subtotal = $data->subtotal;
        $cotizacion->margen_porcentaje = $data->margen;
        $cotizacion->ganancia = $data->ganancia;
        $cotizacion->total = $data->total;
        $cotizacion->items = $data->items; 
        
        if($cotizacion->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "creada exitosamente.",
                "success" => true,
                "folio" => $cotizacion->folio,
                "id" => $cotizacion->id
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "message" => "No se pudo crear la cotización.",
                "success" => false
            ));
        } 
    } else {
        http_response_code(400);
        echo json_encode(array(
            "message" => "Datos incompletos. Se requiere: cliente_nombre, items[]",
            "success" => false
        ));
    } 
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al crear cotización.",
        "error" => $e->getMessage(),
        "success" => false
    ));
}
?>