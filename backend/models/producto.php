<?php
class Producto {
    private $conn;
    private $table_name = "productos";

    public $id;
    public $sku;
    public $nombre;
    public $descripcion;
    public $precio;
    public $proveedor_id;
    public $stock;
    public $activo;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function prepareData($data){
        $this->id = $data['id'];
        $this->sku = $data['sku'];
        $this->nombre = $data['nombre'];
        $this->descripcion = $data['descripcion'];
        $this->precio = $data['precio'];
        $this->proveedor_id = $data['proveedor_id'];
        $this->stock = $data['stock'];
        $this->activo = $data['activo'];
    }

    // Leer todos los productos
    public function read() {
        $query = "SELECT 
                    p.id, p.sku, p.nombre, p.descripcion, p.precio, 
                    p.stock, p.activo, p.proveedor_id,
                    pr.nombre as proveedor
                  FROM " . $this->table_name . " p
                  LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
                  WHERE p.activo = 1
                  ORDER BY p.nombre ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    public function readOne() {
        $query = "SELECT 
                    p.id, p.sku, p.nombre, p.descripcion, p.precio, 
                    p.stock, p.activo, p.proveedor_id,
                    pr.nombre as proveedor
                  FROM " . $this->table_name . " p
                  LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
                  WHERE sku = :sku 
                  ORDER BY p.nombre ASC";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":sku", $this->sku);
        $stmt->execute();

        $row = $stmt->fetch();

        if($row) {
            $this->id = $row['id'];
            $this->sku = $row['sku'];
            $this->nombre = $row['nombre'];
            $this->descripcion = $row['descripcion'];
            $this->precio = $row['precio'];
            $this->proveedor_id = $row['proveedor_id'];
            $this->stock = $row['stock'];
            $this->activo = $row['activo'];
            return true;
        }
        return false;
    }

    // Buscar productos
    public function search($keywords) {
        $query = "SELECT 
                    p.id, p.sku, p.nombre, p.descripcion, p.precio, 
                    p.stock, p.activo, p.proveedor_id,
                    pr.nombre as proveedor
                  FROM " . $this->table_name . " p
                  LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
                  WHERE p.activo = 1 
                    AND (p.sku LIKE ? OR p.nombre LIKE ? OR p.descripcion LIKE ?)
                  ORDER BY p.nombre ASC
                  LIMIT 50";

        $stmt = $this->conn->prepare($query);
        
        $keywords = "%{$keywords}%";
        $stmt->bindParam(1, $keywords);
        $stmt->bindParam(2, $keywords);
        $stmt->bindParam(3, $keywords);
        
        $stmt->execute();

        return $stmt;
    }

    // Crear producto
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                  SET sku = :sku,
                      nombre = :nombre,
                      descripcion = :descripcion,
                      precio = :precio,
                      proveedor_id = :proveedor_id,
                      stock = :stock";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->sku = htmlspecialchars(strip_tags($this->sku));
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->precio = htmlspecialchars(strip_tags($this->precio));
        $this->proveedor_id = htmlspecialchars(strip_tags($this->proveedor_id));
        $this->stock = htmlspecialchars(strip_tags($this->stock));

        // Bind
        $stmt->bindParam(":sku", $this->sku);
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":proveedor_id", $this->proveedor_id);
        $stmt->bindParam(":stock", $this->stock);

        if($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Actualizar producto
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                  SET nombre = :nombre,
                      descripcion = :descripcion,
                      precio = :precio,
                      proveedor_id = :proveedor_id,
                      stock = :stock,
                      activo = :activo
                  WHERE sku = :sku";

        $stmt = $this->conn->prepare($query);

        // Sanitizar
        $this->nombre = htmlspecialchars(strip_tags($this->nombre));
        $this->descripcion = htmlspecialchars(strip_tags($this->descripcion));
        $this->precio = htmlspecialchars(strip_tags($this->precio));
        $this->proveedor_id = htmlspecialchars(strip_tags($this->proveedor_id));
        $this->stock = htmlspecialchars(strip_tags($this->stock));
        $this->activo = htmlspecialchars(strip_tags($this->activo));
        $this->id = htmlspecialchars(strip_tags($this->id));

        // Bind
        $stmt->bindParam(":nombre", $this->nombre);
        $stmt->bindParam(":descripcion", $this->descripcion);
        $stmt->bindParam(":precio", $this->precio);
        $stmt->bindParam(":proveedor_id", $this->proveedor_id);
        $stmt->bindParam(":stock", $this->stock);
        $stmt->bindParam(":activo", $this->activo);
        $stmt->bindParam(":sku", $this->sku);

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

    // Importar productos masivamente
    public function bulkImport($productos) {
        $query = "INSERT INTO " . $this->table_name . "
                  (sku, nombre, precio, proveedor_id, stock)
                  VALUES (:sku, :nombre, :precio, :proveedor_id, :stock)
                  ON DUPLICATE KEY UPDATE
                  nombre = VALUES(nombre),
                  precio = VALUES(precio),
                  stock = VALUES(stock)";

        $stmt = $this->conn->prepare($query);

        $this->conn->beginTransaction();

        try {
            foreach ($productos as $producto) {
                $stmt->bindParam(":sku", $producto['sku']);
                $stmt->bindParam(":nombre", $producto['nombre']);
                $stmt->bindParam(":precio", $producto['precio']);
                $stmt->bindParam(":proveedor_id", $producto['proveedor_id']);
                $stmt->bindParam(":stock", $producto['stock']);
                $stmt->execute();
            }

            $this->conn->commit();
            return true;

        } catch(Exception $e) {
            $this->conn->rollBack();
            error_log("Error en bulk import: " . $e->getMessage());
            return false;
        }
    }
}
?>