<?php
require '../../.env.php';

class Database {
    // Credenciales de la BD
    private $host = "";
    private $db_name = "";
    private $username = "";
    private $password = "";
    private $port = "";
    public $conn;

    public function __construct() {
        $this->loadConfig();
    }

    // Obtener conexión
    public function getConnection() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . 
                ";port=" . $this->port . 
                ";dbname=" . $this->db_name . 
                ";charset=utf8mb4",
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            error_log("Error de conexión: " . $exception->getMessage());
            throw new Exception("Error al conectar con la base de datos");
        }

        return $this->conn;
    }

    // Método para cargar configuración desde archivo
    public function loadConfig() {
        $this->host = getenv('DB_HOST') ?? $this->host;
        $this->db_name = getenv('DB_NAME') ?? $this->db_name;
        $this->username = getenv('DB_USER') ?? $this->username;
        $this->password = getenv('DB_PASSWORD') ?? $this->password;
        $this->port = getenv('DB_PORT') ?? $this->port;
    }
}
?>