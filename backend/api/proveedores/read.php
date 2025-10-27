<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';
include_once '../../models/Proveedor.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $proveedor = new Proveedor($db);
    $stmt = $proveedor->read();
    $num = $stmt->rowCount();
    
    if($num > 0) {
        $proveedores_arr = array();
        $proveedores_arr["records"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $proveedor_item = array(
                "id" => intval($id),
                "nombre" => $nombre,
                "contacto" => $contacto,
                "telefono" => $telefono,
                "email" => $email,
                "sitio_web" => $sitio_web,
                "activo" => boolval($activo)
            );
            
            array_push($proveedores_arr["records"], $proveedor_item);
        }
        
        http_response_code(200);
        echo json_encode($proveedores_arr);
    } else {
        http_response_code(200);
        echo json_encode(array(
            "message" => "No se encontraron proveedores.",
            "records" => array()
        ));
    }
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(array(
        "message" => "Error al obtener proveedores.",
        "error" => $e->getMessage()
    ));
}
?>