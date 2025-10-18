<?php
// Wyłącz wyświetlanie błędów PHP
error_reporting(0);
ini_set('display_errors', 0);

// Skrypt do zapisywania danych podstron
header('Content-Type: application/json');

try {
    // Sprawdź metodę
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(array('success' => false, 'error' => 'Method not allowed'));
        exit;
    }
    
    // Pobierz dane
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Walidacja
    if (!isset($data['page']) || !isset($data['content'])) {
        http_response_code(400);
        echo json_encode(array('success' => false, 'error' => 'Missing required fields'));
        exit;
    }
    
    // Sprawdź klucz edycji (hash SHA-256)
    $validHash = 'acbf15f31d8df8ae6379a7958073a08887db5cc0d396e778abcec84256556402';
    $providedHash = isset($data['editKey']) ? hash('sha256', $data['editKey']) : '';
    
    if ($providedHash !== $validHash) {
        http_response_code(403);
        echo json_encode(array('success' => false, 'error' => 'Invalid edit key'));
        exit;
    }
    
    $pageName = basename($data['page'], '.html');
    $content = $data['content'];
    
    // Walidacja nazwy strony (tylko alfanumeryczne i myślniki)
    if (!preg_match('/^[a-z0-9\-]+$/', $pageName)) {
        http_response_code(400);
        echo json_encode(array('success' => false, 'error' => 'Invalid page name'));
        exit;
    }
    
    // Ścieżka do pliku JSON
    $dataDir = __DIR__ . '/data';
    $jsonFile = $dataDir . '/' . $pageName . '.json';
    
    // Utwórz katalog jeśli nie istnieje
    if (!file_exists($dataDir)) {
        if (!mkdir($dataDir, 0755, true)) {
            http_response_code(500);
            echo json_encode(array('success' => false, 'error' => 'Cannot create data directory'));
            exit;
        }
    }
    
    // Zapisz dane
    $jsonData = json_encode($content);
    if ($jsonData && file_put_contents($jsonFile, $jsonData) !== false) {
        echo json_encode(array('success' => true, 'message' => 'Data saved successfully'));
    } else {
        http_response_code(500);
        echo json_encode(array('success' => false, 'error' => 'Failed to save data'));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('success' => false, 'error' => 'Server error'));
}
?>
