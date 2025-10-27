<?php
// Configuración de entorno local
putenv('DB_HOST=localhost');
putenv('DB_NAME=cotizaciones_db');
putenv('DB_USER=root');
putenv('DB_PASSWORD=');
putenv('DB_PORT=3306');

// Configuración de entorno bluehost
#putenv('DB_HOST=localhost');
#putenv('DB_NAME=acciont1_cotizaciones_db');
#putenv('DB_USER=acciont1_cotizador');
#putenv('DB_PASSWORD=25.LalosAT');
#putenv('DB_PORT=3306');


// Configuración SMTP
putenv('SMTP_HOST=mail.grupovivo.com');
putenv('SMTP_PORT=465');
putenv('SMTP_USER=icastro@grupovivo.com');
putenv('SMTP_PASS=0131$AdCz_');
putenv('SMTP_FROM_NAME=Mi Empresa');
putenv('SMTP_FROM_EMAIL=icastro@grupovivo.com');
putenv('SMTP_SECURE=ssl');

// Cargar variables
if (file_exists(__DIR__ . '/.env.php')) {
    require_once __DIR__ . '/.env.php';
}
?>