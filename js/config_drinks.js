// Konfiguracja menu Kraken Bar - Drinks
const MENU_CONFIG = {
    // Ustawienia widoku początkowego
    initialView: {
        // Skala początkowa (powiększenie) jako procent wysokości ekranu
        // 100 = obraz wypełnia 100% wysokości ekranu (cały obraz widoczny)
        // 60 = obraz wypełnia 60% wysokości ekranu (widoczne 60% obrazu, powiększone)
        // UWAGA: Wartość nie może być większa niż 100, bo wtedy pokazałoby tło!
        // System automatycznie ograniczy skalę, aby obraz zawsze wypełniał ekran
        scalePercent: 100,  // 100% szerokości - cały obraz widoczny
        
        // Pozycja początkowa - który punkt obrazu ma być widoczny
        // Wartości 0-100 (procent szerokości/wysokości obrazu)
        // focusX: 0 = lewy brzeg obrazu, 50 = środek, 100 = prawy brzeg
        // focusY: 0 = górny brzeg obrazu, 50 = środek, 100 = dolny brzeg
        focusX: 0,   // Lewy brzeg
        focusY: 0,   // Górny brzeg
        
        // Alternatywnie można użyć predefiniowanych pozycji:
        // 'top-left', 'top-center', 'top-right',
        // 'center-left', 'center', 'center-right',
        // 'bottom-left', 'bottom-center', 'bottom-right'
        // Jeśli ustawione, nadpisuje focusX i focusY
        position: null,  // null = użyj focusX i focusY
    },
    
    // Ustawienia zoomowania
    zoom: {
        minScale: 1,        // Minimalne powiększenie (1 = dopasowanie do ekranu)
        maxScale: 4,        // Maksymalne powiększenie
        step: 1.3,          // Krok zoomowania dla przycisków +/-
        wheelSensitivity: 0.1,  // Czułość kółka myszy (0.1 = 10% na scroll)
        doubleTapZoom: 2.5, // Powiększenie po podwójnym kliknięciu/tapnięciu
    },
    
    // Ustawienia animacji
    animation: {
        preloaderDelay: 500,  // Opóźnienie ukrycia preloadera (ms)
        smoothTransition: true,  // Płynne przejścia przy przesuwaniu
        transitionDuration: 0.2,  // Czas trwania przejścia (sekundy)
        momentum: true,  // Inercja po puszczeniu (momentum scrolling)
        momentumFriction: 0.97,  // Tarcie inercji (0.9-0.99, wyższe = dłuższe wyhamowanie)
    },
    
    // Ustawienia obrazu menu
    image: {
        path: 'images/krakenbar_drinks.jpg',  // Ścieżka do obrazu menu napojów
        alt: 'Drinks Menu Kraken Bar',        // Tekst alternatywny
        width: 3000,   // Szerokość rzeczywista
        height: 7985,  // Wysokość rzeczywista
    },
    
    // Ustawienia interakcji
    interaction: {
        enableMouseDrag: true,    // Włącz przeciąganie myszą
        enableTouchDrag: true,    // Włącz przeciąganie dotykiem
        enableMouseWheel: true,   // Włącz zoom kółkiem myszy
        enablePinchZoom: true,    // Włącz pinch-to-zoom
        enableDoubleTap: true,    // Włącz zoom po podwójnym kliknięciu
    },
    
    // Ustawienia żyroskopu (tylko mobile)
    gyroscope: {
        enabled: true,           // Włącz sterowanie żyroskopem
        sensitivity: 0.15,       // Czułość (0.1-2.0, wyższe = szybsze przesuwanie) - subtelny ruch
        smoothing: 0.08,         // Wygładzanie ruchu (0.05-0.3, niższe = płynniejsze)
        autoEnable: false,       // Automatyczne włączenie przy starcie (false = wymaga kliknięcia przycisku)
    },
    
    // Ustawienia hotspotów
    hotspots: {
        enabled: true,                      // Czy włączyć interaktywne punkty menu
        dataFile: 'data/hotspots_drinks.json',    // Plik JSON z definicjami hotspotów dla napojów
        showOnHover: true,                  // Pokazuj podświetlenie przy najechaniu
        openInNewTab: false,                 // Otwieraj w nowej karcie (false = modal)
        animation: {
            enabled: false,
            duration: 500,        // Czas trwania animacji pojedynczego hotspotu (ms)
            overlap: 50,          // Nakładanie się animacji (ms)
            repeatInterval: 10000 // Powtarzanie animacji co X ms (10 sekund)
        }
    }
};
