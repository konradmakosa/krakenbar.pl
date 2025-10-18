// Interaktywne menu - wersja uproszczona, skupiona na stabilności
document.addEventListener('DOMContentLoaded', function() {
    // Elementy DOM
    const menuContainer = document.getElementById('menuContainer');
    const menuImage = document.getElementById('menuImage');
    const hotspotsContainer = document.getElementById('hotspotsContainer');
    const preloader = document.getElementById('preloader');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetViewBtn = document.getElementById('resetView');
    const interactionHint = document.getElementById('interactionHint');
    
    // Dane o interaktywnych punktach menu (będą dostosowane po analizie obrazu)
    // Te punkty zostaną zaktualizowane po dokładnej analizie zdjęcia menu
    let hotspots = [];
    
    // Funkcja do analizy obrazu i wykrywania potencjalnych interaktywnych elementów menu
    // Pozycje hotspotów są oparte na rzeczywistych pozycjach elementów menu na zdjęciu
    function analyzeMenuImage() {
        // Pozycje są wyrażone jako procent szerokości i wysokości obrazu
        // x, y to lewy górny róg prostokąta, width i height to szerokość i wysokość w pikselach
        hotspots = [
            // Pierwsza kolumna - lewa strona
            { id: 1, x: 5, y: 22, width: 200, height: 25, name: 'Krewetki z Chorizo 38.00' },
            { id: 2, x: 5, y: 56, width: 200, height: 25, name: 'Mule na ostro 36.00' },
            { id: 3, x: 5, y: 90, width: 200, height: 25, name: 'Mule w sosie śmietanowym 36.00' },
            { id: 4, x: 5, y: 124, width: 200, height: 25, name: 'Jalapeno Shrimp 32.00' },
            { id: 5, x: 5, y: 158, width: 200, height: 25, name: 'Tatar z Matiasa 25.00' },
            { id: 6, x: 5, y: 192, width: 200, height: 25, name: 'Tosty z Sardynką 22.00' },
            { id: 7, x: 5, y: 226, width: 200, height: 25, name: 'Sałatki' },
            { id: 8, x: 5, y: 260, width: 200, height: 25, name: 'Cesarska z Krewetkami 37.00' },
            
            // Środkowa kolumna
            { id: 9, x: 35, y: 158, width: 200, height: 25, name: 'Tatar z Łososia 26.00' },
            { id: 10, x: 35, y: 192, width: 200, height: 25, name: 'Sardynki bretońskie z grilla 29.00' },
            { id: 11, x: 35, y: 260, width: 200, height: 25, name: 'Szprotki 26.00' },
            
            // Prawa kolumna
            { id: 12, x: 65, y: 22, width: 200, height: 25, name: 'Philly Cheese Steak 29.00' },
            { id: 13, x: 65, y: 56, width: 200, height: 25, name: 'Shrimp Burger 35.00' },
            { id: 14, x: 65, y: 90, width: 200, height: 25, name: 'Tuna Burger 35.00' },
            { id: 15, x: 65, y: 124, width: 200, height: 25, name: 'Hot Pan Sea Food Mix 39.00' },
            { id: 16, x: 65, y: 158, width: 200, height: 25, name: 'Hot Pan - krewetki 38.00' },
            { id: 17, x: 65, y: 192, width: 200, height: 25, name: 'Hot Pan - kalmary' },
            { id: 18, x: 65, y: 226, width: 200, height: 25, name: 'Hot Pan - ośmiorniczki 38.00' }
        ];
    }
    
    // Zmienne do obsługi interakcji
    let currentScale = 1;
    let posX = 0;
    let posY = 0;
    let startPosX = 0;
    let startPosY = 0;
    let startClientX = 0;
    let startClientY = 0;
    let isDragging = false;
    let lastTapTime = 0;
    let pinchStartDistance = 0;
    let initialScale = 1;
    let menuHighlight = null;
    
    // Minimalna i maksymalna skala
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 5;
    
    // Inicjalizacja
    function init() {
        // Ukryj preloader po załadowaniu obrazu
        menuImage.onload = function() {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 500);
            
            // Analizuj obraz menu, aby wykryć interaktywne elementy
            analyzeMenuImage();
            
            // Dodaj interaktywne punkty po załadowaniu obrazu
            createHotspots();
            
            // Dodaj element podświetlenia
            createMenuHighlight();
            
            // Dodaj przycisk żyroskopu jeśli urządzenie jest mobilne i obsługuje żyroskop
            if (isMobileDevice() && hasDeviceOrientation()) {
                createGyroButton();
            }
        };
        
        // Obsługa błędu ładowania obrazu
        menuImage.onerror = function() {
            console.error('Błąd ładowania obrazu menu');
            preloader.classList.add('hidden');
        };
        
        // Ustaw początkową pozycję obrazu
        resetView();
        
        // Dodaj nasłuchiwacze zdarzeń
        setupEventListeners();
    }
    
    // Tworzenie interaktywnych punktów menu
    function createHotspots() {
        hotspots.forEach(spot => {
            const hotspot = document.createElement('div');
            hotspot.className = 'hotspot';
            hotspot.dataset.id = spot.id;
            hotspot.dataset.name = spot.name;
            
            // Zapisz wymiary jako atrybuty data
            hotspot.dataset.width = spot.width || 150;
            hotspot.dataset.height = spot.height || 30;
            
            // Ustawienie pozycji hotspota jako procent szerokości/wysokości obrazu
            hotspot.style.left = `${spot.x}%`;
            hotspot.style.top = `${spot.y}%`;
            
            // Początkowe ustawienie szerokości i wysokości
            hotspot.style.width = `${spot.width || 150}px`;
            hotspot.style.height = `${spot.height || 30}px`;
            
            // Opcjonalnie możemy dodać tekst wewnątrz hotspota dla łatwiejszej identyfikacji
            // hotspot.textContent = spot.name;
            
            hotspotsContainer.appendChild(hotspot);
        });
    }
    
    // Tworzenie elementu podświetlenia menu
    function createMenuHighlight() {
        menuHighlight = document.createElement('div');
        menuHighlight.className = 'menu-highlight';
        menuHighlight.style.width = '150px';
        menuHighlight.style.height = '30px';
        menuContainer.appendChild(menuHighlight);
    }
    
    // Konfiguracja nasłuchiwaczy zdarzeń
    function setupEventListeners() {
        // Obsługa przycisków kontrolnych
        zoomInBtn.addEventListener('click', zoomIn);
        zoomOutBtn.addEventListener('click', zoomOut);
        resetViewBtn.addEventListener('click', resetView);
        
        // Obsługa kliknięć w hotspoty
        hotspotsContainer.addEventListener('click', handleHotspotClick);
        
        // Obsługa najechania na hotspot
        hotspotsContainer.addEventListener('mousemove', handleHotspotHover);
        hotspotsContainer.addEventListener('touchmove', handleHotspotHover);
        
        // Obsługa przesuwania myszą
        menuContainer.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', endDrag);
        
        // Obsługa kółka myszy do zoomowania
        menuContainer.addEventListener('wheel', handleWheel);
        
        // Obsługa dotyku (dla urządzeń mobilnych)
        menuContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        menuContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        menuContainer.addEventListener('touchend', handleTouchEnd);
        
        // Obsługa podwójnego kliknięcia/tapnięcia
        menuContainer.addEventListener('dblclick', handleDoubleClick);
        
        // Żyroskop będzie włączany ręcznie przez przycisk
        
        // Ukryj wskazówkę po pierwszej interakcji
        menuContainer.addEventListener('click', hideHintAfterInteraction);
        menuContainer.addEventListener('touchstart', hideHintAfterInteraction, { once: true });
    }
    
    // Obsługa najechania na hotspot
    function handleHotspotHover(e) {
        if (isDragging) return; // Nie pokazuj podpowiedzi podczas przeciągania
        
        const hotspot = e.target.closest('.hotspot');
        if (hotspot) {
            const name = hotspot.dataset.name;
            
            // Pokaż podpowiedź
            showTooltip(hotspot, name);
        } else {
            // Ukryj podpowiedź jeśli nie ma hotspota
            hideTooltip();
        }
    }
    
    // Pokaż podpowiedź dla hotspota
    let tooltipTimeout;
    let currentTooltip = null;
    
    function showTooltip(hotspot, text) {
        // Usuń poprzednią podpowiedź
        hideTooltip();
        
        // Stwórz nową podpowiedź
        clearTimeout(tooltipTimeout);
        tooltipTimeout = setTimeout(() => {
            const tooltip = document.createElement('div');
            tooltip.className = 'menu-tooltip';
            tooltip.textContent = text;
            
            // Pobierz pozycję hotspota w pikselach
            const hotspotRect = hotspot.getBoundingClientRect();
            
            // Stwórz tooltip w kontenerze hotspotów, aby poruszał się razem z obrazem
            tooltip.style.position = 'absolute';
            tooltip.style.left = hotspot.style.left;
            tooltip.style.top = `calc(${hotspot.style.top} - 40px)`;
            tooltip.style.transform = 'translateX(-25%)';
            tooltip.style.zIndex = '50';
            
            hotspotsContainer.appendChild(tooltip);
            currentTooltip = tooltip;
            
            // Pokaż podpowiedź z animacją
            setTimeout(() => {
                tooltip.style.opacity = '1';
            }, 10);
        }, 200); // Opóźnienie pokazania podpowiedzi
    }
    
    function hideTooltip() {
        clearTimeout(tooltipTimeout);
        if (currentTooltip) {
            currentTooltip.style.opacity = '0';
            
            setTimeout(() => {
                if (currentTooltip && currentTooltip.parentNode) {
                    currentTooltip.parentNode.removeChild(currentTooltip);
                }
                currentTooltip = null;
            }, 200);
        }
    }
    
    // Ukryj wskazówkę po pierwszej interakcji
    function hideHintAfterInteraction() {
        setTimeout(() => {
            interactionHint.style.opacity = '0';
            setTimeout(() => {
                interactionHint.style.display = 'none';
            }, 500);
        }, 2000);
    }
    
    // Obsługa kliknięcia w hotspot
    function handleHotspotClick(e) {
        const hotspot = e.target.closest('.hotspot');
        if (hotspot) {
            const id = hotspot.dataset.id;
            const name = hotspot.dataset.name;
            
            // Ukryj wszystkie podpowiedzi
            hideTooltip();
            
            // Pokaż efekt kliknięcia
            showClickEffect(hotspot);
            
            // Dodaj klasę aktywną do hotspota
            hotspot.classList.add('active');
            
            // Stwórz modal z informacją o daniu
            const modal = createDishModal(name, id);
            document.body.appendChild(modal);
            
            // Pokaż modal z animacją
            setTimeout(() => {
                modal.classList.add('visible');
            }, 10);
            
            // Usuń klasę aktywną po chwili
            setTimeout(() => {
                hotspot.classList.remove('active');
            }, 500);
        }
    }
    
    // Tworzenie modalu z informacją o daniu
    function createDishModal(name, id) {
        const modal = document.createElement('div');
        modal.className = 'dish-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${name}</h2>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Tutaj będzie opis dania o ID: ${id}</p>
                    <p>W przyszłości będzie tu więcej informacji, zdjęcia, składniki, itp.</p>
                </div>
            </div>
        `;
        
        // Dodaj obsługę zamykania modalu
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        });
        
        // Zamykanie modalu przez kliknięcie poza nim
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
        
        return modal;
    }
    
    // Pokaż efekt kliknięcia na hotspot
    function showClickEffect(hotspot) {
        // Pobierz pozycję i wymiary hotspota
        const rect = hotspot.getBoundingClientRect();
        
        // Stwórz efekt kliknięcia bezpośrednio w kontenerze hotspotów
        const effect = document.createElement('div');
        effect.className = 'click-effect';
        effect.style.position = 'absolute';
        effect.style.left = hotspot.style.left;
        effect.style.top = hotspot.style.top;
        effect.style.width = hotspot.style.width;
        effect.style.height = hotspot.style.height;
        effect.style.borderRadius = '4px';
        effect.style.backgroundColor = 'rgba(201, 166, 107, 0.6)';
        effect.style.border = '2px solid var(--accent-color)';
        effect.style.boxShadow = '0 0 20px var(--accent-color)';
        effect.style.zIndex = '15';
        effect.style.pointerEvents = 'none';
        
        // Dodaj efekt do kontenera hotspotów
        hotspotsContainer.appendChild(effect);
        
        // Animuj i usuń po krótkim czasie
        setTimeout(() => {
            effect.style.opacity = '0';
            setTimeout(() => {
                if (effect.parentNode) {
                    effect.parentNode.removeChild(effect);
                }
            }, 300);
        }, 500);
    }
    
    // Funkcje do obsługi przesuwania myszą
    function startDrag(e) {
        if (e.button !== 0) return; // tylko lewy przycisk myszy
        
        isDragging = true;
        startClientX = e.clientX;
        startClientY = e.clientY;
        startPosX = posX;
        startPosY = posY;
        
        menuContainer.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startClientX;
        const dy = e.clientY - startClientY;
        
        posX = startPosX + dx;
        posY = startPosY + dy;
        
        // Ogranicz przesunięcie, aby nie pokazywać tła
        limitPanning();
        
        updateMenuPosition();
        e.preventDefault();
    }
    
    function endDrag() {
        isDragging = false;
        menuContainer.style.cursor = 'grab';
    }
    
    // Obsługa kółka myszy
    function handleWheel(e) {
        e.preventDefault();
        
        // Określ punkt zoomowania (pozycja kursora)
        const rect = menuContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Zmień skalę
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        zoomAtPoint(mouseX, mouseY, currentScale + delta);
    }
    
    // Obsługa dotyku
    function handleTouchStart(e) {
        e.preventDefault();
        
        const touches = e.touches;
        
        // Obsługa przesuwania jednym palcem
        if (touches.length === 1) {
            isDragging = true;
            startClientX = touches[0].clientX;
            startClientY = touches[0].clientY;
            startPosX = posX;
            startPosY = posY;
            
            // Obsługa podwójnego tapnięcia
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            if (tapLength < 300 && tapLength > 0) {
                handleDoubleClick(e);
            }
            
            lastTapTime = currentTime;
        }
        // Obsługa pinch-to-zoom (dwoma palcami)
        else if (touches.length === 2) {
            pinchStartDistance = getPinchDistance(e);
            initialScale = currentScale;
        }
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
        
        const touches = e.touches;
        
        // Przesuwanie jednym palcem
        if (touches.length === 1 && isDragging) {
            const dx = touches[0].clientX - startClientX;
            const dy = touches[0].clientY - startClientY;
            
            posX = startPosX + dx;
            posY = startPosY + dy;
            
            // Ogranicz przesunięcie, aby nie pokazywać tła
            limitPanning();
            
            updateMenuPosition();
        }
        // Pinch-to-zoom dwoma palcami
        else if (touches.length === 2) {
            const currentDistance = getPinchDistance(e);
            const scaleFactor = currentDistance / pinchStartDistance;
            
            // Oblicz środek między dwoma palcami jako punkt zoomowania
            const touch1 = touches[0];
            const touch2 = touches[1];
            const centerX = (touch1.clientX + touch2.clientX) / 2;
            const centerY = (touch1.clientY + touch2.clientY) / 2;
            
            const rect = menuContainer.getBoundingClientRect();
            const zoomX = centerX - rect.left;
            const zoomY = centerY - rect.top;
            
            zoomAtPoint(zoomX, zoomY, initialScale * scaleFactor);
        }
    }
    
    function handleTouchEnd() {
        isDragging = false;
    }
    
    // Obliczanie odległości między dwoma punktami dotyku
    function getPinchDistance(e) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Obsługa podwójnego kliknięcia
    function handleDoubleClick(e) {
        e.preventDefault();
        
        // Określ punkt zoomowania (pozycja kliknięcia)
        const rect = menuContainer.getBoundingClientRect();
        let zoomX, zoomY;
        
        if (e.touches) {
            zoomX = e.touches[0].clientX - rect.left;
            zoomY = e.touches[0].clientY - rect.top;
        } else {
            zoomX = e.clientX - rect.left;
            zoomY = e.clientY - rect.top;
        }
        
        // Jeśli już przybliżone, oddal; w przeciwnym razie przybliż
        if (currentScale > 1.5) {
            resetView();
        } else {
            zoomAtPoint(zoomX, zoomY, 2.5);
        }
    }
    
    // Obsługa żyroskopu
    let gyroEnabled = false;
    let lastGamma = 0;
    let lastBeta = 0;
    let gyroTimeout;
    
    function handleDeviceOrientation(e) {
        // Tylko jeśli nie jest aktywne przeciąganie
        if (!isDragging && currentScale > 1) {
            // Dostosuj czułość
            const sensitivity = 0.5;
            
            // Oblicz przesunięcie na podstawie nachylenia urządzenia
            const tiltX = e.gamma; // nachylenie lewo-prawo (-90 do 90)
            const tiltY = e.beta;  // nachylenie przód-tył (-180 do 180)
            
            // Oblicz różnicę nachylenia
            const deltaX = tiltX - lastGamma;
            const deltaY = tiltY - lastBeta;
            
            // Zapisz obecne nachylenie jako ostatnie
            lastGamma = tiltX;
            lastBeta = tiltY;
            
            // Zastosuj przesunięcie tylko jeśli nachylenie jest wystarczająco duże
            if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
                posX += deltaX * sensitivity;
                posY += deltaY * sensitivity;
                
                // Ogranicz przesunięcie
                limitPanning();
                
                updateMenuPosition();
                
                // Pokaż informację o aktywnym żyroskopie
                showGyroActiveIndicator();
            }
        }
    }
    
    // Funkcja do włączania/wyłączania żyroskopu
    function toggleGyroscope() {
        if (window.DeviceOrientationEvent) {
            if (!gyroEnabled) {
                // Sprawdź, czy potrzebne jest uprawnienie (iOS 13+)
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                enableGyroscope();
                            } else {
                                alert('Aby używać żyroskopu, musisz udzielić uprawnienia.');
                            }
                        })
                        .catch(console.error);
                } else {
                    // Dla urządzeń bez wymogu uprawnień
                    enableGyroscope();
                }
            } else {
                disableGyroscope();
            }
        } else {
            alert('Twoje urządzenie nie obsługuje żyroskopu.');
        }
    }
    
    function enableGyroscope() {
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        gyroEnabled = true;
        
        // Dodaj przycisk do wyłączenia żyroskopu
        const gyroBtn = document.getElementById('gyroBtn') || createGyroButton();
        gyroBtn.classList.add('active');
        gyroBtn.innerHTML = '🛡️'; // Wyłącz żyroskop
        
        // Pokaż informację o aktywnym żyroskopie
        showGyroActiveIndicator();
    }
    
    function disableGyroscope() {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
        gyroEnabled = false;
        
        // Zaktualizuj przycisk
        const gyroBtn = document.getElementById('gyroBtn');
        if (gyroBtn) {
            gyroBtn.classList.remove('active');
            gyroBtn.innerHTML = '📱'; // Włącz żyroskop
        }
        
        // Ukryj wskaźnik aktywnego żyroskopu
        hideGyroActiveIndicator();
    }
    
    // Tworzenie przycisku do włączania/wyłączania żyroskopu
    function createGyroButton() {
        const gyroBtn = document.createElement('button');
        gyroBtn.id = 'gyroBtn';
        gyroBtn.className = 'control-btn gyro-btn';
        gyroBtn.innerHTML = '📱'; // Ikona telefonu
        gyroBtn.title = 'Włącz/wyłącz sterowanie żyroskopem';
        gyroBtn.addEventListener('click', toggleGyroscope);
        
        document.querySelector('.menu-controls').appendChild(gyroBtn);
        return gyroBtn;
    }
    
    // Pokaż wskaźnik aktywnego żyroskopu
    function showGyroActiveIndicator() {
        clearTimeout(gyroTimeout);
        
        let indicator = document.getElementById('gyroActiveIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'gyroActiveIndicator';
            indicator.className = 'gyro-indicator';
            indicator.textContent = 'Sterowanie żyroskopem aktywne';
            document.body.appendChild(indicator);
        }
        
        indicator.style.opacity = '1';
        
        // Ukryj wskaźnik po 2 sekundach
        gyroTimeout = setTimeout(() => {
            indicator.style.opacity = '0';
        }, 2000);
    }
    
    // Ukryj wskaźnik aktywnego żyroskopu
    function hideGyroActiveIndicator() {
        const indicator = document.getElementById('gyroActiveIndicator');
        if (indicator) {
            indicator.style.opacity = '0';
        }
    }
    
    // Funkcje do obsługi przycisków kontrolnych
    function zoomIn() {
        const centerX = menuContainer.clientWidth / 2;
        const centerY = menuContainer.clientHeight / 2;
        zoomAtPoint(centerX, centerY, currentScale + 0.5);
    }
    
    function zoomOut() {
        const centerX = menuContainer.clientWidth / 2;
        const centerY = menuContainer.clientHeight / 2;
        zoomAtPoint(centerX, centerY, currentScale - 0.5);
    }
    
    function resetView() {
        // Wyśrodkuj obraz
        const containerWidth = menuContainer.clientWidth;
        const containerHeight = menuContainer.clientHeight;
        const imageWidth = menuImage.naturalWidth;
        const imageHeight = menuImage.naturalHeight;
        
        // Oblicz skalowanie dla szerokości i wysokości
        const scaleByHeight = containerHeight / imageHeight;
        const scaleByWidth = containerWidth / imageWidth;
        
        // Użyj większej skali, aby obraz zawsze wypełniał cały ekran
        // bez pokazywania tła
        currentScale = Math.max(scaleByHeight, scaleByWidth);
        
        // Wyśrodkuj obraz
        posX = (containerWidth - imageWidth * currentScale) / 2;
        posY = (containerHeight - imageHeight * currentScale) / 2;
        
        // Upewnij się, że obraz nie pokazuje tła
        if (imageWidth * currentScale < containerWidth) {
            currentScale = containerWidth / imageWidth;
            posX = 0;
            posY = (containerHeight - imageHeight * currentScale) / 2;
        }
        
        if (imageHeight * currentScale < containerHeight) {
            currentScale = containerHeight / imageHeight;
            posY = 0;
            posX = (containerWidth - imageWidth * currentScale) / 2;
        }
        
        updateMenuPosition();
    }
    
    // Zoom w określonym punkcie
    function zoomAtPoint(x, y, newScale) {
        // Ogranicz skalę
        newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        
        // Oblicz nową pozycję, aby zachować punkt zoomowania
        const scaleFactor = newScale / currentScale;
        
        // Punkt przed skalowaniem
        const pointX = (x - posX) / currentScale;
        const pointY = (y - posY) / currentScale;
        
        // Nowa pozycja po skalowaniu
        posX = x - pointX * newScale;
        posY = y - pointY * newScale;
        
        // Zastosuj nową skalę
        currentScale = newScale;
        
        // Ogranicz przesunięcie, aby nie pokazywać tła
        limitPanning();
        
        // Aktualizuj pozycję menu
        updateMenuPosition();
        
        hotspots.forEach(hotspot => {
            const percentX = parseFloat(hotspot.style.left) / 100;
            const percentY = parseFloat(hotspot.style.top) / 100;
            
            // Oblicz pozycję lewego górnego rogu hotspota w pikselach względem obrazu
            const x = percentX * menuImage.naturalWidth;
            const y = percentY * menuImage.naturalHeight;
            
            // Ustaw pozycję hotspota względem obrazu
            hotspot.style.left = `${x}px`;
            hotspot.style.top = `${y}px`;
            hotspot.style.transform = 'none';
            
            // Ustaw szerokość i wysokość hotspota
            hotspot.style.width = `${parseFloat(hotspot.dataset.width || 150)}px`;
            hotspot.style.height = `${parseFloat(hotspot.dataset.height || 30)}px`;
        });
    }
    
    // Aktualizacja pozycji menu
    function updateMenuPosition() {
        // Ogranicz przesunięcie, aby nie pokazywać tła
        limitPanning();
        
        // Aktualizuj transformację obrazu menu
        menuImage.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
        
        // Aktualizuj pozycje hotspotów - umieść je bezpośrednio na obrazie
        const hotspots = document.querySelectorAll('.hotspot');
        
        // Ustaw kontener hotspotów tak, aby poruszał się razem z obrazem
        hotspotsContainer.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
        
        hotspots.forEach(hotspot => {
            const percentX = parseFloat(hotspot.style.left) / 100;
            const percentY = parseFloat(hotspot.style.top) / 100;
            
            // Oblicz pozycję lewego górnego rogu hotspota w pikselach względem obrazu
            const x = percentX * menuImage.naturalWidth;
            const y = percentY * menuImage.naturalHeight;
            
            // Ustaw pozycję hotspota względem obrazu
            hotspot.style.left = `${x}px`;
            hotspot.style.top = `${y}px`;
            hotspot.style.transform = 'none';
            
            // Ustaw szerokość i wysokość hotspota
            hotspot.style.width = `${parseFloat(hotspot.dataset.width || 150)}px`;
            hotspot.style.height = `${parseFloat(hotspot.dataset.height || 30)}px`;
        });
    }
    
    // Ogranicz przesuwanie, aby nie wyjeżdżać poza granice obrazu
    function limitPanning() {
        const containerWidth = menuContainer.clientWidth;
        const containerHeight = menuContainer.clientHeight;
        const scaledWidth = menuImage.naturalWidth * currentScale;
        const scaledHeight = menuImage.naturalHeight * currentScale;
        
        // Zawsze zapewnij, że obraz wypełnia cały ekran
        // Oblicz minimalne przesunięcie, aby obraz zawsze pokrywał cały ekran
        let minX, maxX, minY, maxY;
        
        // Jeśli obraz jest szerszy niż kontener po skalowaniu
        if (scaledWidth > containerWidth) {
            // Nie pozwól, aby prawa krawędź obrazu weszła do kontenera
            minX = containerWidth - scaledWidth;
            // Nie pozwól, aby lewa krawędź obrazu weszła do kontenera
            maxX = 0;
        } else {
            // Jeśli obraz jest węższy, wyśrodkuj go i nie pozwól na przesuwanie
            minX = maxX = (containerWidth - scaledWidth) / 2;
        }
        
        // Jeśli obraz jest wyższy niż kontener po skalowaniu
        if (scaledHeight > containerHeight) {
            // Nie pozwól, aby dolna krawędź obrazu weszła do kontenera
            minY = containerHeight - scaledHeight;
            // Nie pozwól, aby górna krawędź obrazu weszła do kontenera
            maxY = 0;
        } else {
            // Jeśli obraz jest niższy, wyśrodkuj go i nie pozwól na przesuwanie
            minY = maxY = (containerHeight - scaledHeight) / 2;
        }
        
        // Zastosuj ograniczenia
        posX = Math.max(minX, Math.min(maxX, posX));
        posY = Math.max(minY, Math.min(maxY, posY));
    }
    
    // Uruchom inicjalizację
    init();
});
