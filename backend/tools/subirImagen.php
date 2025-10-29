<?php
// upload-logo.php

// Configuración de CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de la base de datos
$host = 'localhost';
$dbname = 'cotizaciones_db';
$username = 'root';
$password = 'tu_password'; // Cambia esto por tu contraseña

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos',
        'details' => $e->getMessage()
    ]);
    exit();
}

// Endpoint para subir logo
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Validar que se haya enviado un archivo
    if (!isset($_FILES['logo']) || $_FILES['logo']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'No se ha enviado ningún archivo o hubo un error en la subida'
        ]);
        exit();
    }

    // Validar que se haya enviado el nombre
    if (!isset($_POST['nombre']) || empty(trim($_POST['nombre']))) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El nombre de la empresa es requerido'
        ]);
        exit();
    }

    $nombre = trim($_POST['nombre']);
    $file = $_FILES['logo'];

    // Validar tipo de archivo
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $fileType = mime_content_type($file['tmp_name']);
    
    if (!in_array($fileType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)'
        ]);
        exit();
    }

    // Validar tamaño (5MB máximo)
    $maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'El archivo es demasiado grande. Tamaño máximo: 5MB'
        ]);
        exit();
    }

    // Leer el contenido del archivo
    $logoData = file_get_contents($file['tmp_name']);

    try {
        // Insertar o actualizar en la base de datos
        $sql = "INSERT INTO empresas (nombre, logo) 
                VALUES (:nombre, :logo)
                ON DUPLICATE KEY UPDATE logo = VALUES(logo)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':nombre', $nombre, PDO::PARAM_STR);
        $stmt->bindParam(':logo', $logoData, PDO::PARAM_LOB);
        $stmt->execute();

        $empresaId = $pdo->lastInsertId() ?: $stmt->rowCount();

        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Logo cargado exitosamente',
            'empresaId' => $empresaId
        ]);

    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Error al guardar en la base de datos',
            'details' => $e->getMessage()
        ]);
    }

} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Método no permitido'
    ]);
}
?>