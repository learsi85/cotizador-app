<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Proveedor.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $proveedor = new Proveedor($db);
    
    $data = json_decode(file_get_contents("php://input"));
    
    if(!empty($data->nombre)) {
        $proveedor->nombre = $data->nombre;
        $proveedor->contacto = $data->contacto ?? '';
        $proveedor->telefono = $data->telefono ?? '';
        $proveedor->email = $data->email ?? '';
        $proveedor->sitio_web = $data->sitio_web ?? '';
        
        if($proveedor->create()) {
            http_response_code(201);
            echo json_encode(array(
                "message" => "Proveedor creado exitosamente.",
                "success" => true
            ));
        } else {
            http_response_code(503);
            echo json_encode(array(
                "message" => "No se pudo crear el proveedor.",
                "success" => false
            ));
        }
    } else {
        http_response_code(400);
        echo json_encode(array(
            "message" => "Datos incompletos. Se requiere: nombre",
            "success" => false
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al crear proveedor.",
        "error" => $e->getMessage(),
        "success" => false
    ));
}
?>