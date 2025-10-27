<?php
require_once '../../config/cors.php';

include_once '../../config/database.php';
include_once '../../models/Email.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $data = json_decode(file_get_contents("php://input"));
    
    // Validar datos requeridos
    if(
        empty($data->to) ||
        empty($data->subject) ||
        empty($data->message)
    ) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Faltan campos requeridos: to, subject, message"
        ));
        exit;
    }
    
    $email = new Email();
    $email->setDataBase($db);
    
    $email->destinatario = $data->to;
    $email->asunto = $data->subject;
    $email->mensaje = $data->message;
    $cotizacionHTML = $data->cotizacionHTML ?? null;
    $nombreArchivo = $data->nombreArchivo ?? 'cotizacion.html';
    $email->cotizacion_id = $data->cotizacion_id;
    
    // Si hay cotización adjunta
    if($cotizacionHTML) {
        $resultado = $email->enviarCotizacion(
            $cotizacionHTML,
            $nombreArchivo
        );
    } else {
        // Enviar correo simple
        $htmlMensaje = "
            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                " . nl2br(htmlspecialchars($email->mensaje)) . "
            </div>
        ";
        
        $resultado = $email->enviar($htmlMensaje);
    }
    
    if($resultado) {
        if($email->create()){
            http_response_code(200);
            echo json_encode(array(
                "success" => true,
                "message" => "Correo enviado exitosamente y en BD",
                "to" => $email->destinatario
            ));
        }else{
            http_response_code(500);
            echo json_encode(array(
            "success" => false,
            "message" => "No se pudo guardar en BD"
        ));    
        }
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "No se pudo enviar el correo"
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "success" => false,
        "message" => "Error al enviar correo",
        "error" => $e->getMessage()
    ));
}
?>