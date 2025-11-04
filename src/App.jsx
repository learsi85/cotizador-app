import React, { useState, useEffect } from 'react';
import parse from 'html-react-parser';
import { Calendar, Mail, FileText, Plus, Send, Download, Trash2, Clock, Upload, Search, ShoppingCart, Package, Settings, Image, Building2, RefreshCw, Check, X } from 'lucide-react';

// Configuración del API
const API_BASE_URL = 'https://acciontic.com.mx/cotizador_AT/api';
//const API_BASE_URL = 'http://localhost/cotizador/backend/api';

export default function BusinessAssistant() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const [productos, setProductos] = useState([]);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [correos, setCorreos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cotizacion, setCotizacion] = useState('');
  const [activeCot, setActiveCot] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [proveedorFiltro, setProveedorFiltro] = useState('todos');
  const [clienteCotizacion, setClienteCotizacion] = useState('');
  const [margenGanancia, setMargenGanancia] = useState(20);

  const [configEmpresa, setConfigEmpresa] = useState({
    nombre: 'Mi Empresa',
    logo: '',
    direccion: '',
    telefono: '',
    email: '',
    rfc: '',
    sitio_web: '',
    condiciones_pago: 'Pago: 50% anticipo, 50% contra entrega',
    condiciones_entrega: 'Entrega: 5-7 días hábiles',
    vigencia_cotizacion: '15 días',
    notas_adicionales: 'Precios sujetos a cambio sin previo aviso'
  });

  const [configSMTP, setConfigSMTP] = useState({
    host: 'smtp.gmail.com',
    puerto: '587',
    usuario: '',
    password: '',
    remitente: '',
    usarSSL: false
  });

  const [nuevoCorreo, setNuevoCorreo] = useState({
    destinatario: '',
    asunto: '',
    mensaje: '',
    adjuntarCotizacion: null
  });

  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    fecha: '',
    hora: '',
    descripcion: ''
  });

  const [mostrarConfigSMTP, setMostrarConfigSMTP] = useState(false);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);
  const [mostrarModalCotizacion, setMostrarModalCotizacion] = useState(false);
  const [proveedores, setProveedores] = useState([]);
  
  const [nuevoProducto, setNuevoProducto] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    precio: '',
    proveedor_id: null,
    stock: 0
  });

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    sitio_web: ''
  });

  // Cargar datos de la empresa
  useEffect(() => {
    if (activeTab === 'config') {
      cargarEmpresa();
    }
  }, [activeTab]);

  // Cargar productos al inicio
  useEffect(() => {
    if (activeTab === 'catalogo') {
      cargarProductos();
      cargarProveedores();
      cargarEmpresa();
    }
  }, [activeTab]);

  // Cargar cotizaciones al cambiar a esa pestaña
  useEffect(() => {
    if (activeTab === 'cotizaciones') {
      cargarCotizaciones();
      setActiveCot('');
    }
  }, [activeTab]);

  // Cargar correos al cambiar a esa pestaña
  useEffect(() => {
    if (activeTab === 'correos') {
      cargarCorreos();
    }
  }, [activeTab]);

  // ========== FUNCIONES DE API - EMPRESA ==============

  const cargarEmpresa = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/empresas/read.php`);
      const data = await response.json();

      if (data) {
        setConfigEmpresa(data);
      } else {
        setConfigEmpresa([]);
        console.log(data.records);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos Empresa:', error);
      setLoading(false);
    }
  }

  const editarEmpresaAPI = async () => {
    try{
      const response = await fetch(`${API_BASE_URL}/empresas/update.php`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configEmpresa)
      });
      
      const data = await response.json();
      //console.log(data);
      
      if (data.success) {
        alert('✅ Datos actualizados con éxito');
        cargarEmpresa();
        return true;
      } else {
        alert('❌ Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar los datos');
      return false;
    }
  }

  // ========== FUNCIONES DE API - PROVEEDORES ==========

  const cargarProveedores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/read.php`);
      const data = await response.json();
      
      if (data.records) {
        setProveedores(data.records);
      } else {
        setProveedores([]);
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    }
  };

  const agregarProveedorAPI = async (proveedor) => {
    try {
      const response = await fetch(`${API_BASE_URL}/proveedores/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(proveedor)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Proveedor agregado exitosamente');
        cargarProveedores();
        return true;
      } else {
        alert('❌ Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar proveedor');
      return false;
    }
  };

  // ========== FUNCIONES DE API - PRODUCTOS ==========
  
  const cargarProductos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/productos/read.php`);
      const data = await response.json();
      //console.log(data);
      
      if (data.records) {
        setProductos(data.records);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar productos desde el servidor');
    } finally {
      setLoading(false);
    }
  };

  const buscarProductos = async (termino) => {
    if (!termino) {
      cargarProductos();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/productos/search.php?q=${encodeURIComponent(termino)}`);
      const data = await response.json();
      
      if (data.records) {
        setProductos(data.records);
      } else {
        setProductos([]);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  const agregarProductoAPI = async (producto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Producto agregado exitosamente');
        cargarProductos();
        return true;
      } else {
        alert('❌ Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar producto');
      return false;
    }
  };

  const editarProductoAPI = async (producto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(producto)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Producto editado exitosamente');
        cargarProductos();
        return true;
      } else {
        alert('❌ Error: ' + data.message);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al editar producto');
      return false;
    }
  };

  const editarProducto = async (id) => {

    try {
      const response = await fetch(`${API_BASE_URL}/productos/search.php?sku=${encodeURIComponent(id)}`);
 
      const data = await response.json();
      //console.log(data);

      if(data.message){
        alert('❌ Error: ' + data.message);
      }else{
        //console.log(data);
        setNuevoProducto(data);
        setMostrarModalProducto(true);
      } 
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  // ========== FUNCIONES DE API - COTIZACIONES ==========

  const cargarCotizaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cotizaciones/read.php`);
      const data = await response.json();
      
      if (data.records) {
        setCotizaciones(data.records);
      } else {
        setCotizaciones([]);
      }
    } catch (error) {
      console.error('Error al cargar cotizaciones:', error);
      alert('Error al cargar cotizaciones desde el servidor');
    } finally {
      setLoading(false);
    }
  };

  const generarCotizacion = async () => {
    if (!clienteCotizacion) {
      alert('Por favor ingresa el nombre del cliente');
      return;
    }
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setLoading(true);
    
    const cotizacionData = {
      cliente_nombre: clienteCotizacion,
      fecha: new Date().toISOString().split('T')[0],
      subtotal: calcularSubtotal(),
      margen: margenGanancia,
      ganancia: calcularGanancia(),
      total: calcularTotal(),
      items: carrito.map(item => ({
        producto_id: item.id,
        sku: item.sku,
        nombre: item.nombre,
        cantidad: item.cantidad,
        costo: item.precio,
        precio: (Math.round((((item.precio * (1 + margenGanancia / 100)) * .16 + (item.precio * (1 + margenGanancia / 100))) + 5) / 10) * 10) / 1.16,
        proveedor: item.proveedor
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/cotizaciones/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cotizacionData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Cotización ${data.folio} generada exitosamente`);
        setCarrito([]);
        setClienteCotizacion('');
        setActiveTab('cotizaciones');
        cargarCotizaciones();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar cotización');
    } finally {
      setLoading(false);
    }
  };

  const cargarCotizacionDetalle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cotizaciones/read.php?id=${id}`);
      const data = await response.json();
      setActiveCot(id);
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  };

  const actualizaCotizacion = async (cot) => {
    const aux = activeCot ? activeCot : cot.id;
    const auxCot = {
      id: aux,
      estado: cot.estado,
    };
    console.log(activeCot);
    try {
      const response = await fetch(`${API_BASE_URL}/cotizaciones/update.php`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auxCot)
      });
      const data = await response.json();
      if (data.success) {
        //alert(`✅ Cotización actualizada exitosamente`);
        cargarCotizaciones();
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  } 

  // ========== FUNCIONES DE API - EMAIL ==========

  const enviarCorreo = async () => {
    if (!nuevoCorreo.destinatario || !nuevoCorreo.asunto) {
      alert('Por favor completa destinatario y asunto');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        to: nuevoCorreo.destinatario,
        subject: nuevoCorreo.asunto,
        message: nuevoCorreo.mensaje,
        cotizacionHTML: nuevoCorreo.adjuntarCotizacion ? generarHTMLCotizacion(nuevoCorreo.adjuntarCotizacion) : null,
        nombreArchivo: nuevoCorreo.adjuntarCotizacion ? `${nuevoCorreo.adjuntarCotizacion.folio || nuevoCorreo.adjuntarCotizacion.id}.pdf` : null,
        cotizacion_id: activeCot,
      };

      const response = await fetch(`${API_BASE_URL}/email/send-cotizacion.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      //console.log(data);

      if (data.success) {
        alert(`✅ Correo enviado exitosamente a ${nuevoCorreo.destinatario}!`);
        actualizaCotizacion({estado: 'enviada'});       
        
        const correo = {
          id: Date.now(),
          ...nuevoCorreo,
          fecha: new Date().toLocaleString(),
          enviado: true
        };
        
        setCorreos([...correos, correo]);
        setNuevoCorreo({ destinatario: '', asunto: '', mensaje: '', adjuntarCotizacion: null });
      } else {
        alert('❌ Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error de conexión con el servidor. Verifica que el backend PHP esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const testConexionSMTP = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/email/test.php`);
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Conexión SMTP exitosa!');
      } else {
        alert('❌ Error de conexión SMTP: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al probar conexión SMTP');
    } finally {
      setLoading(false);
    }
  };

  const cargarCorreos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/email/read.php`);
      const data = await response.json();
      //console.log(data);
      
      if (data.records) {
        setCorreos(data.records);
      } else {
        setCorreos([]);
      }
    } catch (error) {
      console.error('Error al cargar correos:', error);
      alert('Error al cargar correos desde el servidor');
    } finally {
      setLoading(false);
    }
  }

  // ========== FUNCIONES LOCALES ==========

  const cargarLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setConfigEmpresa({...configEmpresa, logo: event.target.result});
      alert('✅ Logo cargado correctamente');
    };
    reader.readAsDataURL(file);
  };

  const cargarCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const texto = event.target.result;
      const lineas = texto.split('\n');
      
      if (lineas.length < 2) {
        alert('El archivo debe tener al menos una línea de encabezado y una de datos');
        return;
      }

      const encabezados = lineas[0].split(',').map(h => h.trim().toLowerCase());
      
      const indices = {
        sku: encabezados.findIndex(h => h.includes('sku') || h.includes('código') || h.includes('code')),
        nombre: encabezados.findIndex(h => h.includes('nombre') || h.includes('descripción') || h.includes('name') || h.includes('producto')),
        precio: encabezados.findIndex(h => h.includes('precio') || h.includes('price') || h.includes('costo')),
        proveedor: encabezados.findIndex(h => h.includes('proveedor') || h.includes('marca')),
        stock: encabezados.findIndex(h => h.includes('stock') || h.includes('inventario'))
      };

      const productosNuevos = [];
      
      for (let i = 1; i < lineas.length; i++) {
        const linea = lineas[i].trim();
        if (!linea) continue;
        
        const valores = linea.split(',').map(v => v.trim());
        
        const producto = {
          sku: indices.sku >= 0 ? valores[indices.sku] : `SKU-${i}`,
          nombre: indices.nombre >= 0 ? valores[indices.nombre] : 'Producto sin nombre',
          precio: indices.precio >= 0 ? parseFloat(valores[indices.precio].replace(/[^0-9.]/g, '')) || 0 : 0,
          proveedor_id: null,
          stock: indices.stock >= 0 ? parseInt(valores[indices.stock]) || 0 : 0
        };
        
        if (producto.nombre && producto.precio > 0) {
          productosNuevos.push(producto);
        }
      }

      if (productosNuevos.length === 0) {
        alert('No se pudieron importar productos');
        return;
      }

      // Importar productos a la base de datos
      setLoading(true);
      let importados = 0;
      
      for (const prod of productosNuevos) {
        const resultado = await agregarProductoAPI(prod);
        if (resultado) importados++;
      }

      alert(`✅ ${importados} de ${productosNuevos.length} productos importados`);
      cargarProductos();
      e.target.value = '';
      setLoading(false);
    };

    reader.readAsText(file);
  };

  const productosFiltrados = productos.filter(p => {
    const coincideBusqueda = 
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.sku.toLowerCase().includes(busqueda.toLowerCase());
    
    const coincideProveedor = 
      proveedorFiltro === 'todos' || (p.proveedor && p.proveedor === proveedorFiltro);
    
    return coincideBusqueda && coincideProveedor;
  });

  const nombresProveedores = ['todos', ...proveedores.map(p => p.nombre)];

  const agregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item.id === producto.id);
    if (existe) {
      setCarrito(carrito.map(item => 
        item.id === producto.id 
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
  };

  const actualizarCantidad = (id, cantidad) => {
    if (cantidad <= 0) {
      setCarrito(carrito.filter(item => item.id !== id));
    } else {
      setCarrito(carrito.map(item => 
        item.id === id ? { ...item, cantidad } : item
      ));
    }
  };

  const calcularSubtotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const calcularTotal = () => {
    const subtotal = calcularSubtotal();
    let subtotaux = subtotal * (1 + margenGanancia / 100);
    subtotaux = (subtotaux * .16 + subtotaux) + 5;
    subtotaux = (Math.round(subtotaux / 10) * 10) / 1.16;
    return subtotaux; // subtotal * (1 + margenGanancia / 100);
  };

  const calcularGanancia = () => {
    return calcularTotal() - calcularSubtotal();
  };

  const generarHTMLCotizacion = (cot) => {
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
        :root { --azul-oscuro: #005595; --azul-claro: #1976d2; --gris-claro: #f5f5f5; --gris-texto: #444;}
        body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 0; background-color: #fff; color: var(--gris-texto);}
        .cotizacion { width: 90%; max-width: 900px; margin: 40px auto; background: white; padding: 40px; border: 1px solid #ddd; border-radius: 10px; box-sizing: border-box;}
        header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; border-bottom: 3px solid var(--azul-claro); padding-bottom: 10px; margin-bottom: 20px; gap: 10px;}
        header img { height: 60px; max-width: 100%;}
        .empresa { text-align: right; color: var(--azul-oscuro); flex: 1; min-width: 220px;}
        .empresa h2 { margin: 0; font-size: 22px; }
        .empresa p {margin: 2px 0; font-size: 13px;}
        .datos-cliente { margin-bottom: 20px;}
        .datos-cliente h3 {color: var(--azul-oscuro); border-bottom: 2px solid var(--azul-claro); display: inline-block; padding-bottom: 4px; margin-bottom: 10px; }
        .tabla-contenedor { width: 105%; overflow-x: auto;}
        table {width: 100%; border-collapse: collapse; margin-bottom: 20px;}
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;}
        th { background-color: var(--azul-claro); color: white; }
        
        .totales {width: 100%; max-width: 300px; margin-left: auto; margin-top: 10px;}
        .totales table { width: 100%; border: none;}
        .totales td { border: none; padding: 6px 0; text-align: right;}
        
        .total-final { font-size: 18px; font-weight: bold; color: var(--azul-oscuro);}
        .condiciones { clear: both; margin-top: 50px; font-size: 12px;}
        .condiciones h4 { color: var(--azul-oscuro); border-bottom: 2px solid var(--azul-claro); display: inline-block; padding-bottom: 2px;}
        .footer {font-size: 10px; position: absolute; height: 20px}
        /* Modo impresión */
        @page { margin-left: 0.5cm;	margin-right: 0.5cm; margin-top: 0; margin-bottom: 0}
        /* Responsivo */
        @media (max-width: 600px) {.cotizacion {padding: 20px;width: 95%;}header {flex-direction: column; align-items: flex-start; text-align: left; }
          .empresa {text-align: left;}table, th, td {font-size: 13px;}.totales {width: 100%;max-width: 100%;}.total-final {font-size: 16px;}}
    </style>
  </head>
  <body>
    <div class="cotizacion">
      <header>
        ${configEmpresa.logo ? `<img src="${configEmpresa.logo}" class="logo" alt="Logo">` : `<h2>${configEmpresa.nombre}</h2>`}
        <div class="empresa">
          <h2>${configEmpresa.nombre}</h2>
          ${configEmpresa.direccion ? `<p>${configEmpresa.direccion}</p>` : ''}
          ${configEmpresa.telefono ? `<p>Tel: ${configEmpresa.telefono}</p>` : ''}
          ${configEmpresa.email ? `<p>${configEmpresa.email}</p>` : ''}
          ${configEmpresa.rfc ? `<p>RFC: ${configEmpresa.rfc}</p>` : ''}
          ${configEmpresa.sitio_web ? `<p>${configEmpresa.sitio_web}</p>` : ''}
        </div>
      </header>

      <section class="datos-cliente">
        <h3>COTIZACIÓN ${cot.folio || '#' + cot.id}</h3>
        <p><strong>Nombre:</strong> ${cot.cliente_nombre}</p>
        <p><strong>Fecha:</strong> ${cot.fecha}</p>
        <p><strong>Válida por:</strong> ${configEmpresa.vigencia_cotizacion}</p>
      </section>

      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            ${cot.items.map(item => `
                  <tr>
                    <td>${item.nombre + ' ' + (item.descripcion || '')}</td>
                    <td>${item.cantidad}</td>
                    <td>${parseFloat(item.precio_venta || item.precio).toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</td>
                    <td>${(item.cantidad * parseFloat(item.precio_venta || item.precio)).toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</td>
                  </tr>
              `).join('')}
          </tbody>
        </table>
      </div>

      <div class="totales">
        <table>
          <tr>
            <td>Subtotal:</td>
            <td>${parseFloat(cot.total).toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</td>
          </tr>
          <tr>
            <td>IVA (16%):</td>
            <td>${parseFloat(cot.total * 0.16).toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</td>
          </tr>
          <tr class="total-final">
            <td>Total:</td>
            <td>${parseFloat(cot.total * 0.16 + cot.total).toLocaleString('es-MX', {style:'currency', currency:'MXN'})}</td>
          </tr>
        </table>
      </div>

      <div class="condiciones">
        <h4>Condiciones Comerciales</h4>
        ${configEmpresa.condiciones_pago ? `<p><strong>Condiciones de Pago:</strong> ${configEmpresa.condiciones_pago}</p>` : ''}
        ${configEmpresa.condiciones_entrega ? `<p><strong>Condiciones de Entrega:</strong> ${configEmpresa.condiciones_entrega}</p>` : ''}
        ${configEmpresa.notas_adicionales ? `<p><strong>Notas:</strong> ${configEmpresa.notas_adicionales}</p>` : ''}
      </div>
      <div class="footer">
          <p>Cotización generada el ${new Date().toLocaleString('es-MX')}<br/>
          ${configEmpresa.nombre} - Todos los derechos reservados</p>
      </div>
    </div>
  </body>
</html>
    `;
  };

  const verCotizacion = async (cot) => {
    let cotizacionCompleta = cot;
    if (!cot.items || cot.items.length === 0) {
      cotizacionCompleta = await cargarCotizacionDetalle(cot.id);
      if (!cotizacionCompleta) {
        alert('Error al cargar detalle de la cotización');
        return;
      }
    }
    setMostrarModalCotizacion(true);

    const htmlContent = generarHTMLCotizacion(cotizacionCompleta);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    setCotizacion(`<iframe src="${url}" style="width: 100%; height: 100%" title="Página web en modal" />`);
    
  }

  const descargarPDF = async (cot) => {

    const data = await generarPDF(cot);
    if(data){
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = cot.folio+'.pdf';
      a.click();
    }
    
  };

  const generarPDF = async(cot) => {
    // Si la cotización no tiene items, cargarla de la BD
    let cotizacionCompleta = cot;
    if (!cot.items || cot.items.length === 0) {
      cotizacionCompleta = await cargarCotizacionDetalle(cot.id);
      if (!cotizacionCompleta) {
        alert('Error al cargar detalle de la cotización');
        return;
      }
    }

    const htmlContent = generarHTMLCotizacion(cotizacionCompleta)+"$%&"+cot.folio;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    try {
      //const response = await fetch(`${API_BASE_URL}/../tools/createPDF.php`);
      const response = await fetch(`${API_BASE_URL}/../tools/createPDF.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Accept': '*/*' 
        },
        body: blob
      });  

      const data = await response.blob();
      //console.log(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      alert('Error generar el PDF');
      return false
    } finally {
      setLoading(false);
    }

  };

  const adjuntarCotizacion = async (cot) => {
    // Cargar cotización completa con items
    const cotizacionCompleta = await cargarCotizacionDetalle(cot.id);
    setActiveCot(cot.id);
    
    if (!cotizacionCompleta) {
      alert('Error al cargar la cotización');
      return;
    }

    generarPDF(cot);

    setNuevoCorreo({
      ...nuevoCorreo,
      asunto: `Cotización ${cotizacionCompleta.folio} - ${configEmpresa.nombre}`,
      mensaje: `Estimado/a ${cotizacionCompleta.cliente_nombre},\n\nAdjunto encontrarás la cotización ${cotizacionCompleta.folio} por un total de ${parseFloat(cotizacionCompleta.total * .16 + cotizacionCompleta.total).toLocaleString('es-MX', {style:'currency', currency:'MXN'})}.\n\n${configEmpresa.condiciones_pago}\n${configEmpresa.condiciones_entrega}\n\nQuedo atento a tus comentarios.\n\nSaludos cordiales,\n${configEmpresa.nombre}`,
      adjuntarCotizacion: cotizacionCompleta
    });
    setActiveTab('correos');
  };

  const guardarEvento = () => {
    if (!nuevoEvento.titulo || !nuevoEvento.fecha) {
      alert('Por favor completa título y fecha');
      return;
    }
    const evento = {
      id: Date.now(),
      ...nuevoEvento
    };
    setEventos([...eventos, evento]);
    setNuevoEvento({ titulo: '', fecha: '', hora: '', descripcion: '' });
    alert('✅ Evento agregado');
  };

  const eliminarEvento = (id) => {
    setEventos(eventos.filter(e => e.id !== id));
  };

  const abrirModalProducto = () => {
    setNuevoProducto({
      sku: '',
      nombre: '',
      descripcion: '',
      precio: '',
      proveedor_id: null,
      stock: 0
    });
    setMostrarModalProducto(true);
  };

  const cerrarModalProducto = () => {
    setMostrarModalProducto(false);
    setNuevoProducto({
      sku: '',
      nombre: '',
      descripcion: '',
      precio: '',
      proveedor_id: null,
      stock: 0
    });
  };

  const guardarNuevoProducto = async () => {
    // Validaciones
    if (!nuevoProducto.sku || !nuevoProducto.nombre || !nuevoProducto.precio) {
      alert('Por favor completa los campos requeridos: SKU, Nombre y Precio');
      return;
    }

    if (parseFloat(nuevoProducto.precio) <= 0) {
      alert('El precio debe ser mayor a 0');
      return;
    }

    setLoading(true);

    let productoData = {
      sku: nuevoProducto.sku,
      nombre: nuevoProducto.nombre,
      descripcion: nuevoProducto.descripcion,
      precio: parseFloat(nuevoProducto.precio),
      proveedor_id: nuevoProducto.proveedor_id,
      stock: parseInt(nuevoProducto.stock) || 0
    };

    if(nuevoProducto.id){
      productoData.id = nuevoProducto.id;
      //console.log(productoData);
      const resultado = await editarProductoAPI(productoData);
      if (resultado) {
        cerrarModalProducto();
        cargarProductos();
      }
    }else{
      const resultado = await agregarProductoAPI(productoData);
      if (resultado) {
        cerrarModalProducto();
        cargarProductos();
      }
    }

    setLoading(false);
  };

  const abrirModalProveedor = () => {
    setNuevoProveedor({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      sitio_web: ''
    });
    setMostrarModalProveedor(true);
  };

  const cerrarModalProveedor = () => {
    setMostrarModalProveedor(false);
    setNuevoProveedor({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      sitio_web: ''
    });
  };

  const cerrarModalCotizacion = () => {
    setMostrarModalCotizacion(false);
  }

  const guardarNuevoProveedor = async () => {
    // Validación
    if (!nuevoProveedor.nombre) {
      alert('Por favor ingresa el nombre del proveedor');
      return;
    }

    setLoading(true);

    const resultado = await agregarProveedorAPI(nuevoProveedor);

    if (resultado) {
      cerrarModalProveedor();
      cargarProveedores();
    }

    setLoading(false);
  };

  const guardarConfigEmpresa = async (id) => {
    //configEmpresa.id = id;
    //console.log(configEmpresa);
    setLoading(true);

    const resultado = await editarEmpresaAPI(configEmpresa);

    if(resultado){
      cargarEmpresa();
    }
    setLoading(false);
  }

  // Efecto para búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (busqueda) {
        buscarProductos(busqueda);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [busqueda]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Sistema de Cotizaciones Profesional</h1>
                <p className="text-blue-100">Versión Prueba 1</p>
              </div>
              {loading && (
                <RefreshCw className="animate-spin" size={24} />
              )}
            </div>
          </div>

          {/* Modal para Agregar Producto */}
          {mostrarModalProducto && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      Producto
                    </h2>
                    <button
                      onClick={cerrarModalProducto}
                      className="text-white hover:text-gray-200 transition"
                      disabled={loading}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        SKU <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nuevoProducto.sku}
                        onChange={(e) => setNuevoProducto({...nuevoProducto, sku: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: LAP001"
                        disabled={nuevoProducto.id ? true : loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                        <input
                          type="number"
                          value={nuevoProducto.precio}
                          onChange={(e) => setNuevoProducto({...nuevoProducto, precio: e.target.value})}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nuevoProducto.nombre}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, nombre: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Laptop Dell Latitude 5430"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={nuevoProducto.descripcion}
                      onChange={(e) => setNuevoProducto({...nuevoProducto, descripcion: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows="3"
                      placeholder="Descripción detallada del producto..."
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                        <span>Proveedor</span>
                        <button
                          onClick={() => {
                            cerrarModalProducto();
                            abrirModalProveedor();
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          type="button"
                        >
                          <Plus size={12} />
                          Nuevo
                        </button>
                      </label>
                      <select
                        value={nuevoProducto.proveedor_id || ''}
                        onChange={(e) => setNuevoProducto({...nuevoProducto, proveedor_id: e.target.value ? parseInt(e.target.value) : null})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        disabled={loading}
                      >
                        <option value="">Sin proveedor</option>
                        {proveedores.map(prov => (
                          <option key={prov.id} value={prov.id}>{prov.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Inicial
                      </label>
                      <input
                        type="number"
                        value={nuevoProducto.stock}
                        onChange={(e) => setNuevoProducto({...nuevoProducto, stock: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 flex gap-3 justify-end border-t">
                  <button
                    onClick={cerrarModalProducto}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarNuevoProducto}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Guardar Producto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal para Agregar Proveedor */}
          {mostrarModalProveedor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Building2 size={24} />
                      Agregar Nuevo Proveedor
                    </h2>
                    <button
                      onClick={cerrarModalProveedor}
                      className="text-white hover:text-gray-200 transition"
                      disabled={loading}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Proveedor <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nuevoProveedor.nombre}
                      onChange={(e) => setNuevoProveedor({...nuevoProveedor, nombre: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Distribuidora XYZ"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Persona de Contacto
                      </label>
                      <input
                        type="text"
                        value={nuevoProveedor.contacto}
                        onChange={(e) => setNuevoProveedor({...nuevoProveedor, contacto: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: Juan Pérez"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={nuevoProveedor.telefono}
                        onChange={(e) => setNuevoProveedor({...nuevoProveedor, telefono: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="(55) 1234-5678"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={nuevoProveedor.email}
                      onChange={(e) => setNuevoProveedor({...nuevoProveedor, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="contacto@proveedor.com"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sitio Web
                    </label>
                    <input
                      type="url"
                      value={nuevoProveedor.sitio_web}
                      onChange={(e) => setNuevoProveedor({...nuevoProveedor, sitio_web: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://www.proveedor.com"
                      disabled={loading}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>💡 Tip:</strong> Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 flex gap-3 justify-end border-t">
                  <button
                    onClick={cerrarModalProveedor}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={guardarNuevoProveedor}
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Plus size={18} />
                        Guardar Proveedor
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal para ver cotización */}
          {mostrarModalCotizacion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <button
                onClick={cerrarModalCotizacion}
                className="text-white hover:text-gray-20 transition"
                disabled={loading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-full overflow-y-auto" id="divHtml">
                {parse(cotizacion)}
              </div>
            </div>
          )}

          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('config')}
              className={`py-4 px-4 flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === 'config'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Settings size={18} />
              <span className="font-medium text-sm">Configuración</span>
            </button>
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`py-4 px-4 flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === 'catalogo'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Package size={18} />
              <span className="font-medium text-sm">Catálogo ({productos.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('carrito')}
              className={`py-4 px-4 flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === 'carrito'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart size={18} />
              <span className="font-medium text-sm">Carrito ({carrito.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('cotizaciones')}
              className={`py-4 px-4 flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === 'cotizaciones'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              <span className="font-medium text-sm">Cotizaciones</span>
            </button>
            <button
              onClick={() => setActiveTab('correos')}
              className={`py-4 px-4 flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === 'correos'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Mail size={18} />
              <span className="font-medium text-sm">Correos</span>
            </button>
            <button
              onClick={() => setActiveTab('agenda')}
              className={`py-4 px-4 flex items-center justify-center gap-2 transition whitespace-nowrap ${
                activeTab === 'agenda'
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Calendar size={18} />
              <span className="font-medium text-sm">Agenda</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'config' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border border-yellow-200 mb-6">
                  <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Settings size={20} />
                    Configuración del Backend PHP
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={cargarProductos}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                      Probar Conexión
                    </button>
                    <button
                      onClick={testConexionSMTP}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      Test SMTP
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 size={24} />
                    Información de la Empresa
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Empresa</label>
                      <div className="flex items-center gap-4">
                        {configEmpresa.logo && (
                          <img src={configEmpresa.logo} alt="Logo" className="h-20 w-auto border border-gray-300 rounded" />
                        )}
                        <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer">
                          <Image size={20} />
                          {configEmpresa.logo ? 'Cambiar Logo' : 'Subir Logo'}
                          <input type="file" accept="image/*" onChange={cargarLogo} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
                        <input
                          type="text"
                          value={configEmpresa.nombre}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, nombre: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Mi Empresa S.A. de C.V."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">RFC</label>
                        <input
                          type="text"
                          value={configEmpresa.rfc}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, rfc: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="ABC123456XYZ"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                      <input
                        type="text"
                        value={configEmpresa.direccion}
                        onChange={(e) => setConfigEmpresa({...configEmpresa, direccion: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Calle, Número, Colonia, Ciudad, CP"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                        <input
                          type="text"
                          value={configEmpresa.telefono}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, telefono: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="(55) 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={configEmpresa.email}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="ventas@empresa.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                        <input
                          type="text"
                          value={configEmpresa.sitio_web}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, sitio_web: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="www.empresa.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condiciones de Pago</label>
                      <textarea
                        value={configEmpresa.condiciones_pago}
                        onChange={(e) => setConfigEmpresa({...configEmpresa, condiciones_pago: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows="2"
                        placeholder="Ej: 50% anticipo, 50% contra entrega"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Condiciones de Entrega</label>
                      <textarea
                        value={configEmpresa.condiciones_entrega}
                        onChange={(e) => setConfigEmpresa({...configEmpresa, condiciones_entrega: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        rows="2"
                        placeholder="Ej: 5-7 días hábiles"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vigencia de Cotización</label>
                        <input
                          type="text"
                          value={configEmpresa.vigencia_cotizacion}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, vigencia_cotizacion: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="15 días"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
                        <input
                          type="text"
                          value={configEmpresa.notas_adicionales}
                          onChange={(e) => setConfigEmpresa({...configEmpresa, notas_adicionales: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          placeholder="Precios sujetos a cambio"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => guardarConfigEmpresa(configEmpresa.id)}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium"
                    >
                      Guardar Configuración de Empresa
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Mail size={24} />
                      Configuración SMTP (Configurar en PHP Backend)
                    </h2>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>📝 Nota:</strong> La configuración SMTP se hace en el archivo <code className="bg-white px-2 py-1 rounded">/.env.php</code> del backend PHP.
                    </p>
                    <div className="mt-3 text-xs text-gray-700 bg-white p-3 rounded font-mono">
                      putenv('SMTP_HOST=smtp.gmail.com');<br/>
                      putenv('SMTP_PORT=587');<br/>
                      putenv('SMTP_USER=tucorreo@gmail.com');<br/>
                      putenv('SMTP_PASS=tu_password_app');<br/>
                      putenv('SMTP_FROM_NAME=Mi Empresa');<br/>
                      putenv('SMTP_FROM_EMAIL=tucorreo@gmail.com');
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'catalogo' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-dashed border-green-300">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Gestión de Productos</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={abrirModalProducto}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Plus size={20} />
                      Nuevo Producto
                    </button>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
                      <Upload size={20} />
                      Importar CSV
                      <input type="file" accept=".csv" onChange={cargarCSV} className="hidden" disabled={loading} />
                    </label>
                    {/*<button
                      onClick={agregarProductoEjemplo}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      <Package size={20} />
                      Productos de Ejemplo
                    </button>*/}
                    <button
                      onClick={cargarProductos}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                      Recargar
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    💡 Agrega productos manualmente, importa desde CSV o usa ejemplos para probar
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre o SKU..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={proveedorFiltro}
                      onChange={(e) => setProveedorFiltro(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option key="todos" value="todos">Todos los proveedores</option>
                      {proveedores.map(p => (
                        <option key={p.id} value={p.nombre}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Productos ({productosFiltrados.length})
                  </h3>
                  {loading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="animate-spin mx-auto mb-3" size={48} />
                      <p className="text-gray-500">Cargando productos...</p>
                    </div>
                  ) : productosFiltrados.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Package size={48} className="mx-auto mb-3 opacity-50" />
                      <p>No hay productos en el catálogo</p>
                      <p className="text-sm">Importa un CSV o agrega productos de ejemplo</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {productosFiltrados.map(producto => (
                        <div key={producto.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
                          <div className="flex justify-between items-start mb-2">
                            <button 
                              onClick={() => editarProducto(producto.sku)}
                              className="text-black font-mono bg-gray-100 px-2 py-1 rounded hover:bg-blue"
                            > 
                              {producto.sku}
                            </button>
                            <span className={`text-xs px-2 py-1 rounded ${
                              producto.stock > 10 ? 'bg-green-100 text-green-700' :
                              producto.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              Stock: {producto.stock}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 h-12">
                            {producto.nombre}
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">{producto.proveedor || 'Sin proveedor'}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-xl font-bold text-blue-600">
                              ${parseFloat(producto.precio).toLocaleString()}
                            </span>
                            <button
                              onClick={() => agregarAlCarrito(producto)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Plus size={16} />
                              Agregar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'carrito' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Carrito de Cotización</h2>
                  
                  {carrito.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                      <p>El carrito está vacío</p>
                      <p className="text-sm">Agrega productos desde el catálogo</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {carrito.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{item.nombre}</h4>
                              <p className="text-xs text-gray-500">SKU: {item.sku} | {item.proveedor}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Costo: ${parseFloat(item.precio).toLocaleString()}
                              </p>
                            </div>
                            <button
                              onClick={() => actualizarCantidad(item.id, 0)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="w-12 text-center text-black font-semibold">{item.cantidad}</span>
                              <button
                                onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                                className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold text-gray-800">
                              ${(item.precio * item.cantidad).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}

                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cliente
                            </label>
                            <input
                              type="text"
                              value={clienteCotizacion}
                              onChange={(e) => setClienteCotizacion(e.target.value)}
                              placeholder="Nombre del cliente"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Margen de Ganancia: {margenGanancia}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={margenGanancia}
                              onChange={(e) => setMargenGanancia(parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 space-y-2 border-t border-blue-200 pt-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal (Costo):</span>
                            <span className="text-gray-600 font-semibold">${calcularSubtotal().toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ganancia ({margenGanancia}%):</span>
                            <span className="font-semibold text-green-600">
                              +${calcularGanancia().toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between text-lg pt-2 border-t border-blue-300">
                            <span className="font-bold text-gray-800">Total a Cobrar:</span>
                            <span className="font-bold text-blue-600">
                              ${calcularTotal().toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={generarCotizacion}
                          disabled={loading}
                          className="w-full mt-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {loading ? (
                            <RefreshCw size={20} className="animate-spin" />
                          ) : (
                            <FileText size={20} />
                          )}
                          Generar Cotización
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'cotizaciones' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">📋 Cotizaciones Generadas</h2>
                  <button
                    onClick={cargarCotizaciones}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Recargar
                  </button>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="animate-spin mx-auto mb-3" size={48} />
                    <p className="text-gray-500">Cargando cotizaciones...</p>
                  </div>
                ) : cotizaciones.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 opacity-50" />
                    <p>No hay cotizaciones generadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cotizaciones.map(cot => (
                      <div key={cot.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{cot.cliente_nombre}</h3>
                            <p className="text-sm text-gray-600">Fecha: {cot.fecha}</p>
                            <p className="text-sm text-gray-600">{cot.folio}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded text-xs font-semibold ${
                              cot.estado === 'enviada' ? 'bg-blue-100 text-blue-700' :
                              cot.estado === 'aceptada' ? 'bg-green-100 text-green-700' :
                              cot.estado === 'rechazada' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {cot.estado || 'borrador'}
                            </span>
                            <button
                              onClick={() => 
                                //setActiveCot({id: `${cot.id}`, estado: 'aceptada'}); 
                                actualizaCotizacion({id: `${cot.id}`, estado: 'aceptada'})
                              }
                              className='inline-block mt-2 px-3 py-1 text-xs bg-green-100 text-green-700'
                            >
                              <Check size={10}/>
                            </button>
                            <button
                              onClick={() => {
                                //setActiveCot({id: `${cot.id}`, estado: 'rechazada'}); 
                                actualizaCotizacion({id: `${cot.id}`, estado: 'rechazada'})
                              }}
                              className='inline-block mt-2 px-3 py-1 text-xs bg-red-100 text-red-700'
                            >
                              <X size={10}/>
                            </button>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => verCotizacion(cot)}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                              <Search size={18} />
                              Ver
                            </button>
                            <button
                              onClick={() => descargarPDF(cot)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                              <Download size={18} />
                              PDF
                            </button>
                            <button
                              onClick={() => adjuntarCotizacion(cot)}
                              disabled={loading}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                              <Mail size={18} />
                              Enviar
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {cot.total_items} productos
                            </span>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Ganancia: <span className="text-green-600 font-semibold">
                                  ${parseFloat(cot.ganancia).toLocaleString()}
                                </span> ({cot.margen}%)
                              </p>
                              <p className="text-xl font-bold text-blue-600">
                                ${parseFloat(cot.total).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'correos' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Redactar Correo</h2>
                  
                  {nuevoCorreo.adjuntarCotizacion && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        <span className="text-sm font-medium text-blue-800">
                          Cotización {nuevoCorreo.adjuntarCotizacion.folio || '#' + nuevoCorreo.adjuntarCotizacion.id} adjunta
                        </span>
                      </div>
                      <button
                        onClick={() => setNuevoCorreo({...nuevoCorreo, adjuntarCotizacion: null})}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destinatario</label>
                      <input
                        type="email"
                        value={nuevoCorreo.destinatario}
                        onChange={(e) => setNuevoCorreo({...nuevoCorreo, destinatario: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="cliente@ejemplo.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Asunto</label>
                      <input
                        type="text"
                        value={nuevoCorreo.asunto}
                        onChange={(e) => setNuevoCorreo({...nuevoCorreo, asunto: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Asunto del correo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                      <textarea
                        value={nuevoCorreo.mensaje}
                        onChange={(e) => setNuevoCorreo({...nuevoCorreo, mensaje: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        rows="10"
                        placeholder="Escribe tu mensaje aquí..."
                      />
                    </div>

                    <button
                      onClick={enviarCorreo}
                      disabled={loading}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <RefreshCw size={20} className="animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                      Enviar Correo
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Correos Guardados</h3>
                  {correos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay correos guardados</p>
                  ) : (
                    <div className="space-y-3">
                      {correos.map((correo) => (
                        <div key={correo.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800">{correo.asunto}</h4>
                              <p className="text-sm text-gray-600">Para: {correo.destinatario}</p>
                              <p className="text-xs text-gray-500 mt-1">{correo.fecha}</p>
                              {correo.adjuntarCotizacion && (
                                <div className="flex items-center gap-1 mt-2">
                                  <FileText size={14} className="text-blue-600" />
                                  <span className="text-xs text-blue-600">
                                    Cotización adjunta
                                  </span>
                                </div>
                              )}
                            </div>
                            <Mail className="text-purple-600" size={20} />
                          </div>
                          <p className="text-sm text-gray-700 mt-2 line-clamp-2">{correo.mensaje}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg border border-green-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Nuevo Evento</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                      <input
                        type="text"
                        value={nuevoEvento.titulo}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Nombre del evento"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                        <input
                          type="date"
                          value={nuevoEvento.fecha}
                          onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                        <input
                          type="time"
                          value={nuevoEvento.hora}
                          onChange={(e) => setNuevoEvento({...nuevoEvento, hora: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                      <textarea
                        value={nuevoEvento.descripcion}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows="3"
                        placeholder="Detalles del evento..."
                      />
                    </div>

                    <button
                      onClick={guardarEvento}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 font-medium flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      Agregar a Agenda
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Próximos Eventos</h3>
                  {eventos.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay eventos programados</p>
                  ) : (
                    <div className="space-y-3">
                      {eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).map((evento) => (
                        <div key={evento.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800">{evento.titulo}</h4>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {evento.fecha}
                                </span>
                                {evento.hora && (
                                  <span className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {evento.hora}
                                  </span>
                                )}
                              </div>
                              {evento.descripcion && (
                                <p className="text-sm text-gray-700 mt-2">{evento.descripcion}</p>
                              )}
                            </div>
                            <button
                              onClick={() => eliminarEvento(evento.id)}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}