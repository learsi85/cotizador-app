<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../models/Email.php';

try {
    $email = new Email();
    
    if($email->testConexion()) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Conexión SMTP exitosa"
        ));
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Error de conexión SMTP 123"
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error de conexión SMTP: ".$e->getMessage(),
        "error" => $e->getMessage()
    ));
}
?>