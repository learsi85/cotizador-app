<?php
class Proveedor {
    private $conn;
    private $table_name = "proveedores";

    public $id;
    public $nombre;
    public $contacto;
    public $telefono;
    public $email;
    public $sitio_web;
    public $activo;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Leer todos los proveedores
    public function read() {
        $query = "SELECT * FROM " . $this->table_name . "
                  WHERE activo = 1
                  ORDER BY nombre ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Crear proveedor
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET nombre = :nombre,
                      contacto = :contacto,
                      telefono = :telefono,
                      email = :email,
                      sitio_web = :sitio_web";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->contacto = htmlspecialchars(strip_tags($this->contacto));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->sitio_web = htmlspecialchars(strip_tags($this->sitio_web));

        // Bind
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":contacto", $this->contacto);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":sitio_web", $this->sitio_web);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Actualizar proveedor
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET nombre = :nombre,
                      contacto = :contacto,
                      telefono = :telefono,
                      email = :email,
                      sitio_web = :sitio_web
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->contacto = htmlspecialchars(strip_tags($this->contacto));
        $this->telefono = htmlspecialchars(strip_tags($this->telefono));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->sitio_web = htmlspecialchars(strip_tags($this->sitio_web));
        $this->id = htmlspecialchars(strip_tags($this->id));

        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":contacto", $this->contacto);
        $stmt->bindParam(":telefono", $this->telefono);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":sitio_web", $this->sitio_web);
        $stmt->bindParam(":id", $this->id);

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