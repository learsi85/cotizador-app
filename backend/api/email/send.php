<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include_once '../../models/Email.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if(empty($data->to) || empty($data->subject)) {
        http_response_code(400);
        echo json_encode(array(
            "success" => false,
            "message" => "Faltan campos requeridos: to, subject"
        ));
        exit;
    }
    
    $email = new Email();
    
    $htmlMensaje = "
        <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            " . nl2br(htmlspecialchars($data->message ?? '')) . "
        </div>
    ";
    
    $resultado = $email->enviar(
        $data->to,
        $data->subject,
        $data->message ?? '',
        $htmlMensaje
    );
    
    if($resultado) {
        http_response_code(200);
        echo json_encode(array(
            "success" => true,
            "message" => "Correo enviado exitosamente"
        ));
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