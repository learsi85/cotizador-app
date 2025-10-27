<?php
// Requiere PHPMailer (instalar con Composer)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../../vendor/autoload.php';
require '../../.env.php';

class Email {
    private $mailer;
    private $config;

    private $conn;
    private $table_name = "correos";

    public $id;
    public $cotizacion_id;
    public $destinatario;
    public $asunto;
    public $mensaje;
    public $enviado;
    public $fecha_envio;
    public $message_id;
    public $error;
    public $created_at;

    public function __construct($config = null) {
        $this->mailer = new PHPMailer(true);
        $this->config = $config ?? $this->loadConfig();
        $this->configurarSMTP();
    }

    public function setDataBase($db) {
        $this->conn = $db;
    }

    // Cargar configuración desde BD o archivo
    private function loadConfig() {
        // Por defecto, cargar de variables de entorno o archivo
        return [
            'host' => getenv('SMTP_HOST') ?: 'smtp.gmail.com',
            'port' => getenv('SMTP_PORT') ?: 587,
            'username' => getenv('SMTP_USER') ?: '',
            'password' => getenv('SMTP_PASS') ?: '',
            'from_name' => getenv('SMTP_FROM_NAME') ?: 'Mi Empresa',
            'from_email' => getenv('SMTP_FROM_EMAIL') ?: '',
            'secure' => getenv('SMTP_SECURE') ?: 'tls'
        ];
    }

    // Configurar SMTP
    private function configurarSMTP() {
        try {
            $this->mailer->isSMTP();
            $this->mailer->Host = $this->config['host'];
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $this->config['username'];
            $this->mailer->Password = $this->config['password'];
            $this->mailer->SMTPSecure = $this->config['secure'];
            $this->mailer->Port = $this->config['port'];
            $this->mailer->CharSet = 'UTF-8';
            
            // Configuración adicional
            $this->mailer->setFrom($this->config['from_email'], $this->config['from_name']);
            
        } catch (Exception $e) {
            error_log("Error configurando SMTP: " . $e->getMessage());
            throw new Exception("Error de configuración de correo");
        }
    }

    // Enviar correo simple
    public function enviar($html = null) {
        try {
            $this->mailer->addAddress($this->destinatario);
            $this->mailer->Subject = $this->asunto;
            $this->mailer->Body = $html ?? $this->mensaje;
            
            if ($html) {
                $this->mailer->isHTML(true);
                $this->mailer->AltBody = $mensaje;
            }

            $this->mailer->send();
            return true;

        } catch (Exception $e) {
            error_log("Error enviando correo: " . $this->mailer->ErrorInfo);
            $this->error = $this->mailer->ErrorInfo;
            throw new Exception("No se pudo enviar el correo: " . $this->mailer->ErrorInfo);
        }
    }

    // Enviar cotización con adjunto
    public function enviarCotizacion($htmlCotizacion, $nombreArchivo = 'cotizacion.html') {
        try {
            $this->mailer->addAddress($this->destinatario);
            $this->mailer->Subject = $this->asunto;
            
            // Cuerpo del correo
            $htmlMensaje = "
                <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    " . nl2br(htmlspecialchars($this->mensaje)) . "
                    <br><br>
                    <p style='color: #666; font-size: 12px;'>
                        Este correo fue enviado automáticamente desde el Sistema de Cotizaciones.
                    </p>
                </div>
            ";
            
            $this->mailer->isHTML(true);
            $this->mailer->Body = $htmlMensaje;
            $this->mailer->AltBody = $this->mensaje;

            // Adjuntar cotización
            //$this->mailer->addStringAttachment($htmlCotizacion, $nombreArchivo, 'base64', 'text/html');
            $this->mailer->AddAttachment("../../api/".$nombreArchivo, $nombreArchivo);

            $this->mailer->send();
            return true;

        } catch (Exception $e) {
            error_log("Error enviando cotización: " . $this->mailer->ErrorInfo);
            $this->error = $this->mailer->ErrorInfo;
            throw new Exception("No se pudo enviar la cotización: " . $this->mailer->ErrorInfo);
        }
    }

    // Test de conexión
    public function testConexion() {
        try {
            $this->mailer->smtpConnect();
            $this->mailer->smtpClose();
            return true;
        } catch (Exception $e) {
            throw new Exception("Error de conexión SMTP: " . $e->getMessage());
        }
    }

    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET cotizacion_id = :cotizacion_id,
                      destinatario = :destinatario,
                      asunto = :asunto,
                      mensaje = :mensaje,
                      enviado = :enviado,
                      fecha_envio = :fecha_envio,
                      created_at = :created_at";

        $stmt = $this->conn->prepare($query);
        $fecha_Act = date("Y-m-d H:i:s");

        // Sanitizar
        $this->cotizacion_id = htmlspecialchars(strip_tags($this->cotizacion_id));
        $this->destinatario = htmlspecialchars(strip_tags($this->destinatario));
        $this->asunto = htmlspecialchars(strip_tags($this->asunto));
        $this->mensaje = htmlspecialchars(strip_tags($this->mensaje));
        $this->enviado = 1;
        $this->fecha_envio = htmlspecialchars(strip_tags($fecha_Act));
        $this->created_at = htmlspecialchars(strip_tags($fecha_Act));

        // Bind
        $stmt->bindParam(":cotizacion_id", $this->cotizacion_id);
        $stmt->bindParam(":destinatario", $this->destinatario);
        $stmt->bindParam(":asunto", $this->asunto);
        $stmt->bindParam(":mensaje", $this->mensaje);
        $stmt->bindParam(":enviado", $this->enviado);
        $stmt->bindParam(":fecha_envio", $this->fecha_envio);
        $stmt->bindParam(":created_at", $this->created_at);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    public function read() {
        $query = "SELECT *
                  FROM " . $this->table_name ;

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }
}
?>