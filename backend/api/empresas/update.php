<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Empresa.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $empresa = new Empresa($db);
    
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->id)) {
        $empresa->nombre = $data->nombre;
        $empresa->logo = $data->logo;
        $empresa->rfc = $data->rfc;
        $empresa->direccion = $data->direccion;
        $empresa->telefono = $data->telefono;
        $empresa->email = $data->email;
        $empresa->sitio_web = $data->sitio_web;
        $empresa->condiciones_pago = $data->condiciones_pago;
        $empresa->condiciones_entrega = $data->condiciones_entrega;
        $empresa->vigencia_cotizacion = $data->vigencia_cotizacion;
        $empresa->notas_adicionales = $data->notas_adicionales;
        $empresa->id = $data->id;

        if($empresa->update()) {
            http_response_code(200);
            echo json_encode(array(
                "message" => "Datos actualizados exitosamente.",
                "success" => true
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "message" => "No se pudo actualizar la empresa.",
                "success" => false
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array(
            "message" => "Se requiere el id de la empresa",
            "success" => false
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al actualizar la empresa.",
        "error" => $e->getMessage(),
        "success" => false
    ));
}
?>