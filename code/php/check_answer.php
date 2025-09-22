<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!isset($_POST['resposta'], $_SESSION['preguntas'], $_SESSION['indiceActual'], $_SESSION['puntuacion'])) {
    echo json_encode(['error' => 'Dades no vàlides']);
    exit;
}

$respostaUsuari = intval($_POST['resposta']);
$indice = $_SESSION['indiceActual'];
$preguntas = $_SESSION['preguntas'];
$puntuacion = $_SESSION['puntuacion'];

if (!isset($preguntas[$indice])) {
    echo json_encode(['error' => 'Índex de pregunta invàlid']);
    exit;
}

$preguntaActual = $preguntas[$indice];
$correcta = false;
foreach ($preguntaActual['respostes'] as $r) {
    if (!empty($r['correcta']) && intval($r['id']) === $respostaUsuari) {
        $correcta = true;
        break;
    }
}

if ($correcta) $puntuacion++;

$_SESSION['puntuacion'] = $puntuacion;
$_SESSION['indiceActual']++;

$acabado = $_SESSION['indiceActual'] >= count($preguntas);

if ($acabado) {
    echo json_encode([
        'acabat' => true,
        'puntuacio' => $puntuacion,
        'total' => count($preguntas)
    ]);
    exit;
}

// Preparar la següent pregunta sense la resposta correcta
$siguiente = $preguntas[$_SESSION['indiceActual']];
foreach ($siguiente['respostes'] as &$r) {
    unset($r['correcta']);
}
unset($r);

echo json_encode([
    'acabat' => false,
    'correcte' => $correcta,
    'pregunta' => $siguiente['pregunta'] ?? '',
    'imatge' => $siguiente['imatge'] ?? null,
    'respostes' => $siguiente['respostes'] ?? []
    'indice' => $_SESSION['indiceActual'],
    'total' => count($preguntas)
]);
