<?php
class Cotizacion {
    private $conn;
    private $table_name = "cotizaciones";

    public $id;
    public $folio;
    public $cliente_id;
    public $cliente_nombre;
    public $fecha;
    public $subtotal;
    public $margen_porcentaje;
    public $ganancia;
    public $total;
    public $estado;
    public $items;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Generar folio único
    private function generarFolio() {
        $año = date('Y');
        
        $query = "SELECT MAX(CAST(SUBSTRING(folio, -6) AS UNSIGNED)) as ultimo
                  FROM " . $this->table_name . "
                  WHERE folio LIKE :patron";
        
        $stmt = $this->conn->prepare($query);
        $patron = "COT-{$año}-%";
        $stmt->bindParam(":patron", $patron);
        $stmt->execute();
        
        $row = $stmt->fetch();
        $ultimo_numero = $row['ultimo'] ?? 0;
        $nuevo_numero = str_pad($ultimo_numero + 1, 6, '0', STR_PAD_LEFT);
        
        return "COT-{$año}-{$nuevo_numero}";
    }
    
    // Crear cotización
    public function create() {
        $this->conn->beginTransaction();
        
 
        try {
            // Generar folio
            $this->folio = $this->generarFolio();
            
            // Insertar cotización
            $query = "INSERT INTO " . $this->table_name . "
                      SET folio = :folio,
                          cliente_id = :cliente_id,
                          cliente_nombre = :cliente_nombre,
                          fecha = :fecha,
                          subtotal = :subtotal,
                          margen_porcentaje = :margen_porcentaje,
                          ganancia = :ganancia,
                          total = :total,
                          estado = :estado";

            $stmt = $this->conn->prepare($query);

            // Sanitizar
            $this->cliente_nombre = htmlspecialchars(strip_tags($this->cliente_nombre));
            $this->fecha = htmlspecialchars(strip_tags($this->fecha));
            $this->estado = $this->estado ?? 'borrador';

            // Bind
            $stmt->bindParam(":folio", $this->folio);
            $stmt->bindParam(":cliente_id", $this->cliente_id);
            $stmt->bindParam(":cliente_nombre", $this->cliente_nombre);
            $stmt->bindParam(":fecha", $this->fecha);
            $stmt->bindParam(":subtotal", $this->subtotal);
            $stmt->bindParam(":margen_porcentaje", $this->margen_porcentaje);
            $stmt->bindParam(":ganancia", $this->ganancia);
            $stmt->bindParam(":total", $this->total);
            $stmt->bindParam(":estado", $this->estado);

            $stmt->execute();
            $cotizacion_id = $this->conn->lastInsertId();

            // Insertar items
            $query_items = "INSERT INTO cotizacion_items
                            SET cotizacion_id = :cotizacion_id,
                                producto_id = :producto_id,
                                sku = :sku,
                                nombre = :nombre,
                                cantidad = :cantidad,
                                precio_costo = :precio_costo,
                                precio_venta = :precio_venta,
                                subtotal = :subtotal,
                                proveedor = :proveedor";

            $stmt_items = $this->conn->prepare($query_items);

            foreach ($this->items as $item) {
                $stmt_items->bindParam(":cotizacion_id", $cotizacion_id);
                $stmt_items->bindParam(":producto_id", $item->producto_id);
                $stmt_items->bindParam(":sku", $item->sku);
                $stmt_items->bindParam(":nombre", $item->nombre);
                $stmt_items->bindParam(":cantidad", $item->cantidad);
                $stmt_items->bindParam(":precio_costo", $item->costo);
                $stmt_items->bindParam(":precio_venta", $item->precio);
                $subtotal_item = $item->cantidad * $item->precio;
                $stmt_items->bindParam(":subtotal", $subtotal_item);
                $stmt_items->bindParam(":proveedor", $item->proveedor); 
                $stmt_items->execute();
            }

            $this->conn->commit();
            $this->id = $cotizacion_id;
            return true;

        } catch(Exception $e) {
            $this->conn->rollBack();
            error_log("Error al crear cotización: " . $e->getMessage());
            return false;
        } 
    }

    // Actualiza cotizacion
    public function update() {
        $this->conn->beginTransaction();
        
 
        try {            
            // Update cotización
            $query = "UPDATE " . $this->table_name . "
                      SET cliente_id = :cliente_id,
                          cliente_nombre = :cliente_nombre,
                          fecha = :fecha,
                          subtotal = :subtotal,
                          margen_porcentaje = :margen_porcentaje,
                          ganancia = :ganancia,
                          total = :total
                        WHERE id = :id";

            $stmt = $this->conn->prepare($query);

            // Sanitizar
            $this->cliente_nombre = htmlspecialchars(strip_tags($this->cliente_nombre));
            $this->fecha = htmlspecialchars(strip_tags($this->fecha));

            // Bind
            $stmt->bindParam(":cliente_id", $this->cliente_id);
            $stmt->bindParam(":cliente_nombre", $this->cliente_nombre);
            $stmt->bindParam(":fecha", $this->fecha);
            $stmt->bindParam(":subtotal", $this->subtotal);
            $stmt->bindParam(":margen_porcentaje", $this->margen_porcentaje);
            $stmt->bindParam(":ganancia", $this->ganancia);
            $stmt->bindParam(":total", $this->total);
            $stmt->bindParam(":id", $this->id);

            $stmt->execute();
            $query = "DELETE FROM cotizacion_items 
                      WHERE cotizacion_id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":id", $this->id);
            $stmt->execute();

            $cotizacion_id = $this->id;

            // Insertar items
            $query_items = "INSERT INTO cotizacion_items
                            SET cotizacion_id = :cotizacion_id,
                                producto_id = :producto_id,
                                sku = :sku,
                                nombre = :nombre,
                                cantidad = :cantidad,
                                precio_costo = :precio_costo,
                                precio_venta = :precio_venta,
                                subtotal = :subtotal,
                                proveedor = :proveedor";

            $stmt_items = $this->conn->prepare($query_items);

            foreach ($this->items as $item) {
                $stmt_items->bindParam(":cotizacion_id", $cotizacion_id);
                $stmt_items->bindParam(":producto_id", $item->producto_id);
                $stmt_items->bindParam(":sku", $item->sku);
                $stmt_items->bindParam(":nombre", $item->nombre);
                $stmt_items->bindParam(":cantidad", $item->cantidad);
                $stmt_items->bindParam(":precio_costo", $item->costo);
                $stmt_items->bindParam(":precio_venta", $item->precio);
                $subtotal_item = $item->cantidad * $item->precio;
                $stmt_items->bindParam(":subtotal", $subtotal_item);
                $stmt_items->bindParam(":proveedor", $item->proveedor); 
                $stmt_items->execute();
            }

            $this->conn->commit();
            return true;

        } catch(Exception $e) {
            $this->conn->rollBack();
            error_log("Error al crear cotización: " . $e->getMessage());
            return false;
        } 
    }

    // Leer cotizaciones
    public function read() {
        $query = "SELECT 
                    c.id, c.folio, c.cliente_nombre, c.fecha, c.total, 
                    c.subtotal, c.ganancia, c.margen_porcentaje, c.estado,
                    COUNT(ci.id) as total_items
                  FROM " . $this->table_name . " c
                  LEFT JOIN cotizacion_items ci ON c.id = ci.cotizacion_id
                  GROUP BY c.id
                  ORDER BY c.fecha DESC, c.id DESC
                  LIMIT 100";

        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        return $stmt;
    }

    // Leer una cotización con items
    public function readOne() {
        $query = "SELECT * FROM " . $this->table_name . "
                  WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->execute();

        $row = $stmt->fetch();

        if($row) {
            $this->folio = $row['folio'];
            $this->cliente_id = $row['cliente_id'];
            $this->cliente_nombre = $row['cliente_nombre'];
            $this->fecha = $row['fecha'];
            $this->subtotal = $row['subtotal'];
            $this->margen_porcentaje = $row['margen_porcentaje'];
            $this->ganancia = $row['ganancia'];
            $this->total = $row['total'];
            $this->estado = $row['estado'];

            // Obtener items
            $query_items = "SELECT ci.*, p.descripcion 
                            FROM cotizacion_items ci INNER JOIN productos p ON p.id=ci.producto_id
                            WHERE cotizacion_id = :cotizacion_id";
            
            $stmt_items = $this->conn->prepare($query_items);
            $stmt_items->bindParam(":cotizacion_id", $this->id);
            $stmt_items->execute();

            $this->items = $stmt_items->fetchAll();

            return true;
        }

        return false;
    }

    // Actualizar estado
    public function updateEstado($nuevo_estado) {
        try{
            $query = "UPDATE " . $this->table_name . "
                  SET estado = :estado
                  WHERE id = :id";

            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":estado", $nuevo_estado);
            $stmt->bindParam(":id", $this->id);

            $stmt->execute();
            return true;

        }catch (Exception $e) {
            $this->conn->rollBack();
            error_log("Error al actualiar cotización: " . $e->getMessage());
            return false;
        } 
    }
}
?>