<?php
//require_once 'config/cors.php';
// Para depurar y ver qué llega
//$json = file_get_contents('php://input');
//$data = json_decode($json, true);
//echo json_encode($data['items']);
// Ver todo lo que llegó
//echo json_encode(var_dump($data));
//$to = $data['to'] ?? '';

/* foreach ($data['items'] as $item) {
    $item_aux[] = $item['producto_id'];
    //echo json_encode($item['sku']);
} */

//echo json_encode($data['items']);
//echo json_encode($data['items']);

// O enviarlo como respuesta JSON
require '.env.php';

echo "PP";

$host = getenv('DB_HOST') ;
$db_name = getenv('DB_NAME') ;
$username = getenv('DB_USER') ;
$password = getenv('DB_PASSWORD') ;
$port = getenv('DB_PORT') ;

try {
            $conn = new PDO(
                "mysql:host=" . $host . 
                ";port=" . $port . 
                ";dbname=" . $db_name . 
                ";charset=utf8mb4",
                $username,
                $password
            );
            $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            echo("Error de conexión: " . $exception->getMessage());
            throw new Exception("Error al conectar con la base de datos");
        }

$stmt = $conn->prepare("SELECT * FROM empresas");
$stmt->execute();

var_dump($stmt->fetch(PDO::FETCH_ASSOC)); 
?>