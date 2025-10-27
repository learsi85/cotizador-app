<?php
class Empresa {
    private $conn;
    private $table_name = "empresas";

    public $id;
    public $nombre;
    public $logo;
    public $rfc;
    public $direccion;
    public $telefono;
    public $email;
    public $sitio_web;
    public $condiciones_pago;
    public $condiciones_entrega;
    public $vigencia_cotizacion;
    public $notas_adicionales;


    public function __construct($db) {
        $this->conn = $db;
    }

    // Leer datos empresa
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . "
                  WHERE id = :id
                  ORDER BY nombre ASC";

         $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch();

        if($row) {
            $this->nombre = $row['nombre'];
            $this->logo = $row['logo'];
            $this->rfc = $row['rfc'];
            $this->direccion = $row['direccion'];
            $this->telefono = $row['telefono'];
            $this->email = $row['email'];
            $this->sitio_web = $row['sitio_web'];
            $this->condiciones_pago = $row['condiciones_pago'];
            $this->condiciones_entrega = $row['condiciones_entrega'];
            $this->vigencia_cotizacion = $row['vigencia_cotizacion'];
            $this->notas_adicionales = $row['notas_adicionales'];
            $this->id = $row['id'];
            return true;
        }

        return false;
    }

    // Crear empresa
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET nombre = :nombre,
                      logo = :logo,
                      rfc = :rfc,
                      direccion = :direccion,
                      telefono = :telefono,
                      email = :email,
                      sitio_web = :sitio_web,
                      condiciones_pago = :condiciones_pago,
                      condiciones_entrega = :condiciones_entrega,
                      vigencia_cotizacion = :vigencia_cotizacion,
                      notas_adicionales = :notas_adicionales,
                      created_at = :created_at";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->logo = htmlspecialchars(strip_tags($this->logo));
        $this->rfc = htmlspecialchars(strip_tags($this->rfc));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->sitio_web = htmlspecialchars(strip_tags($this->sitio_web));
        $this->condiciones_pago = htmlspecialchars(strip_tags($this->condiciones_pago));
        $this->condiciones_entrega = htmlspecialchars(strip_tags($this->condiciones_entrega));
        $this->vigencia_cotizacion = htmlspecialchars(strip_tags($this->vigencia_cotizacion));
        $this->notas_adicionales = htmlspecialchars(strip_tags($this->notas_adicionales));

        // Bind
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":logo", $this->logo);
        $stmt->bindParam(":rfc", $this->rfc);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":sitio_web", $this->sitio_web);
        $stmt->bindParam(":condiciones_pago", $this->condiciones_pago);
        $stmt->bindParam(":condiciones_entrega", $this->condiciones_entrega);
        $stmt->bindParam(":vigencia_cotizacion", $this->vigencia_cotizacion);
        $stmt->bindParam(":notas_adicionales", $this->notas_adicionales);
        $stmt->bindParam(":created_at",date("Y-m-d H:i:s"));


        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Actualizar empresa
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET nombre = :nombre,
                      logo = :logo,
                      rfc = :rfc,
                      direccion = :direccion,
                      telefono = :telefono,
                      email = :email,
                      sitio_web = :sitio_web,
                      condiciones_pago = :condiciones_pago,
                      condiciones_entrega = :condiciones_entrega,
                      vigencia_cotizacion = :vigencia_cotizacion,
                      notas_adicionales = :notas_adicionales,
                      updated_at = :updated_at
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $fecha_Act = date("Y-m-d H:i:s");

        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->logo = htmlspecialchars(strip_tags($this->logo));
        $this->rfc = htmlspecialchars(strip_tags($this->rfc));
        $this->direccion = htmlspecialchars(strip_tags($this->direccion));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->sitio_web = htmlspecialchars(strip_tags($this->sitio_web));
        $this->condiciones_pago = htmlspecialchars(strip_tags($this->condiciones_pago));
        $this->condiciones_entrega = htmlspecialchars(strip_tags($this->condiciones_entrega));
        $this->vigencia_cotizacion = htmlspecialchars(strip_tags($this->vigencia_cotizacion));
        $this->notas_adicionales = htmlspecialchars(strip_tags($this->notas_adicionales));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":logo", $this->logo);
        $stmt->bindParam(":rfc", $this->rfc);
        $stmt->bindParam(":direccion", $this->direccion);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":sitio_web", $this->sitio_web);
        $stmt->bindParam(":condiciones_pago", $this->condiciones_pago);
        $stmt->bindParam(":condiciones_entrega", $this->condiciones_entrega);
        $stmt->bindParam(":vigencia_cotizacion", $this->vigencia_cotizacion);
        $stmt->bindParam(":notas_adicionales", $this->notas_adicionales);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":updated_at",$fecha_Act);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Eliminar (soft delete)
    public function delete() {
        $query = "UPDATE " . $this->table_name . "
                  SET activo = 0
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(":id", $this->id);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }
}
?>