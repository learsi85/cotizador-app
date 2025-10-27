<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';
include_once '../../models/email.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $email = new Email();
    $email->setDataBase($db);

    $stmt = $email->read();
    $num = $stmt->rowCount();
    
    if($num > 0) {
        $email_arr = array();
        $email_arr["records"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $email_item = array(
                "id" => $id,
                "cotizacion_id" => $cotizacion_id,
                "destinatario" => $destinatario,
                "asunto" => $asunto,
                "mensaje" => $mensaje,
                "fecha_envio" => $fecha_envio
            );
            
            array_push($email_arr["records"], $email_item);
        }
        
        http_response_code(200);
        echo json_encode($email_arr);
    } else {
        http_response_code(200);
        echo json_encode(array(
            "message" => "No se encontraron cotizaciones.",
            "records" => array()
        ));
    }    
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al obtener cotizaciones.",
        "error" => $e->getMessage()
    ));
}
?>