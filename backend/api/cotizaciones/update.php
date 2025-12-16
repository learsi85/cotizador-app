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
            $folio = "COT-" . date('Y') . "-" . str_pad($cotizacion->id, 6, '0', STR_PAD_LEFT);
            echo json_encode(array(
                "message" => "actualizada exitosamente.",
                "success" => true,
                "folio" => $folio,
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
        if(!empty($data->id)){

            $cotizacion->id = $data->id;
            $cotizacion->cliente_id = $data->cliente_id ?? null;
            $cotizacion->cliente_nombre = $data->cliente_nombre;
            $cotizacion->fecha = $data->fecha ?? date('Y-m-d');
            $cotizacion->subtotal = $data->subtotal;
            $cotizacion->ganancia = $data->ganancia;
            $cotizacion->total = $data->total;
            $cotizacion->items = $data->items; 

            if($cotizacion->update()) {
                http_response_code(201);
                $folio = "COT-" . date('Y') . "-" . str_pad($cotizacion->id, 6, '0', STR_PAD_LEFT);
                echo json_encode(array(
                    "message" => "actualizada exitosamente.",
                    "success" => true,
                    "folio" => $folio,
                    "id" => $cotizacion->id
                ));
            } else {
                http_response_code(503);
                echo json_encode(array(
                    "message" => "No se pudo actualizar la cotización.",
                    "success" => false
                ));
            } 
        }else{
            http_response_code(400);
            echo json_encode(array(
                "message" => "Datos incompletos. Se requiere: id y/o estado",
                "success" => false
            ));
        }
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