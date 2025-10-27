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
        !empty($data->id) &&
        !empty($data->estado)
    ) {
        
        $cotizacion->id = $data->id;
        
        if($cotizacion->updateEstado($data->estado)) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Cotización creada exitosamente.",
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
            "message" => "Datos incompletos. Se requiere: id y estado",
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