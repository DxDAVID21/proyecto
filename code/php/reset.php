<?php
session_start();

// Destruir tota la sesió, per a tornar a començar
session_unset();
session_destroy();

// Respondre amb JSON per a confirmar 
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['status' => 'ok']);

