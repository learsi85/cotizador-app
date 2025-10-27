<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once '../../config/database.php';
include_once '../../models/Cotizacion.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $cotizacion = new Cotizacion($db);
    
    // Si se pasa un ID, obtener solo esa cotización
    if(isset($_GET['id'])) {
        $cotizacion->id = $_GET['id'];
        
        if($cotizacion->readOne()) {
            http_response_code(200);
            echo json_encode(array(
                "id" => $cotizacion->id,
                "folio" => $cotizacion->folio,
                "cliente_id" => $cotizacion->cliente_id,
                "cliente_nombre" => $cotizacion->cliente_nombre,
                "fecha" => $cotizacion->fecha,
                "subtotal" => floatval($cotizacion->subtotal),
                "margen" => floatval($cotizacion->margen_porcentaje),
                "ganancia" => floatval($cotizacion->ganancia),
                "total" => floatval($cotizacion->total),
                "estado" => $cotizacion->estado,
                "items" => $cotizacion->items
            ));
        } else {
            http_response_code(404);
            echo json_encode(array("message" => "Cotización no encontrada"));
        }
        exit;
    }
    
    // Obtener todas las cotizaciones
    $stmt = $cotizacion->read();
    $num = $stmt->rowCount();
    
    if($num > 0) {
        $cotizaciones_arr = array();
        $cotizaciones_arr["records"] = array();
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            extract($row);
            
            $cotizacion_item = array(
                "id" => intval($id),
                "folio" => $folio,
                "cliente_nombre" => $cliente_nombre,
                "fecha" => $fecha,
                "subtotal" => floatval($subtotal),
                "ganancia" => floatval($ganancia),
                "margen" => floatval($margen_porcentaje),
                "total" => floatval($total),
                "estado" => $estado,
                "total_items" => intval($total_items)
            );
            
            array_push($cotizaciones_arr["records"], $cotizacion_item);
        }
        
        http_response_code(200);
        echo json_encode($cotizaciones_arr);
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