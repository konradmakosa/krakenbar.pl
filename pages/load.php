<?php
// Wyłącz wyświetlanie błędów PHP
error_reporting(0);
ini_set('display_errors', 0);

// Skrypt do wczytywania danych podstron
header('Content-Type: application/json');

try {
    // Pobierz nazwę strony
    $pageName = isset($_GET['page']) ? basename($_GET['page'], '.html') : '';
    
    // Walidacja nazwy strony
    if (empty($pageName) || !preg_match('/^[a-z0-9\-]+$/', $pageName)) {
        http_response_code(400);
        echo json_encode(array('error' => 'Invalid page name'));
        exit;
    }
    
    // Ścieżka do pliku JSON
    $jsonFile = __DIR__ . '/data/' . $pageName . '.json';
    
    // Sprawdź czy plik istnieje
    if (file_exists($jsonFile)) {
        $content = file_get_contents($jsonFile);
        echo $content;
    } else {
        // Zwróć domyślne dane
        $defaultData = array(
            'image' => '../images/zaslepka.jpg',
            'text' => 'Wpisz opis dania w trybie edycji. Kliknij 5 razy w lewy gorny rog aby aktywowac edycje.'
        );
        echo json_encode($defaultData);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(array('error' => 'Server error'));
}
?>
