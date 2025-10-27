<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Empresa.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $empresa = new Empresa($db);

    $empresa->id = '1';
    
    if($empresa->readOne()) {
        http_response_code(200);
        echo json_encode(array(
            "nombre" => $empresa->nombre ?: '' ,
            "logo" => $empresa->logo ?: '',
            "rfc" => $empresa->rfc ?: '',
            "direccion" => $empresa->direccion ?: '',
            "telefono" => $empresa->telefono ?: '',
            "email" => $empresa->email ?: '',
            "sitio_web" => $empresa->sitio_web ?: '',
            "condiciones_pago" => $empresa->condiciones_pago ?: '',
            "condiciones_entrega" => $empresa->condiciones_entrega ?: '',
            "vigencia_cotizacion" => $empresa->vigencia_cotizacion ?: '',
            "notas_adicionales" => $empresa->notas_adicionales ?: '',
            "id" => $empresa->id
        ));
    } else {
        http_response_code(404);
        echo json_encode(array("message" => "Empresa no encontrada"));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al obtener la empresa.",
        "error" => $e->getMessage()
    ));
}
?>