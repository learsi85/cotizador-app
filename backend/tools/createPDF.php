<?php
// reference the Dompdf namespace
use Dompdf\Dompdf;
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/pdf; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

//require_once '../config/cors.php';
require '../vendor/autoload.php';

$html = file_get_contents("php://input");
$aux = explode("$%&",$html);
$html = $aux[0];
$nombreDelDocumento = '../api/'.$aux[1].'.pdf';
//echo $aux[0];

// instantiate and use the dompdf class
$dompdf = new Dompdf();
$dompdf->loadHtml($html);

// (Optional) Setup the paper size and orientation
$dompdf->setPaper('A4', 'portrait');

// Render the HTML as PDF
//header('Content-Type: application/pdf');
$dompdf->render();

$contenido = $dompdf->output();
// Definir el nombre del archivo
//$nombreDelDocumento = '../ejemplo_guardado.pdf';

// Output the generated PDF to Browser
$dompdf->stream($aux[1], [ "Attachment" => true]);

$bytes = file_put_contents($nombreDelDocumento, $contenido);

?>
