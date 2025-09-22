<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

define('NUM_PREGUNTAS', 10);
define('JSON_FILE', __DIR__ . '/quiz.json');

function errorResponse($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['error' => $msg]);
    exit;
}

if (!file_exists(JSON_FILE)) errorResponse('Arxiu quiz.json no trobat.', 500);

$jsonData = file_get_contents(JSON_FILE);
$datos = json_decode($jsonData, true);
if ($datos === null || !isset($datos['preguntes'])) errorResponse('JSON invàlid o estructura incorrecta.', 500);

$preguntasDisponibles = $datos['preguntes'];
if (count($preguntasDisponibles) === 0) errorResponse('No hi ha preguntes disponibles.', 500);

if (!isset($_SESSION['preguntas'])) {
    $num = min(NUM_PREGUNTAS, count($preguntasDisponibles));
    $indices = array_rand($preguntasDisponibles, $num);
    if (!is_array($indices)) $indices = [$indices];
    $_SESSION['preguntas'] = [];
    foreach ($indices as $i) $_SESSION['preguntas'][] = $preguntasDisponibles[$i];
    $_SESSION['indiceActual'] = 0;
    $_SESSION['puntuacion'] = 0;
}

$indice = $_SESSION['indiceActual'];
if ($indice < 0 || $indice >= count($_SESSION['preguntas'])) errorResponse('Índex de pregunta invàlid.', 400);

$preguntaActual = $_SESSION['preguntas'][$indice];

// Limpiar respostes per no mostrar quina es la correcta
$preguntaCliente = $preguntaActual;
foreach ($preguntaCliente['respostes'] as &$r) {
    unset($r['correcta']);
}
unset($r);

echo json_encode([
    'indice' => $indice,
    'total' => count($_SESSION['preguntas']),
    'pregunta' => $preguntaCliente['pregunta'] ?? '',
    'imatge' => $preguntaCliente['imatge'] ?? null,
    'respostes' => $preguntaCliente['respostes'] ?? []
], JSON_UNESCAPED_UNICODE);
