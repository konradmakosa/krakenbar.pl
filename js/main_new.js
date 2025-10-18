// Interaktywne menu - wersja uproszczona, skupiona na stabilności
document.addEventListener('DOMContentLoaded', function() {
    const menuContainer = document.getElementById('menuContainer');
    const menuImageWrapper = document.getElementById('menuImageWrapper');
    const menuImage = document.getElementById('menuImage');
    const preloader = document.getElementById('preloader');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetViewBtn = document.getElementById('resetView');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Zmienne do przechowywania stanu
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;
    
    // Zmienne do momentum scrolling
    let velocityX = 0;
    let velocityY = 0;
    let lastMoveTime = 0;
    let lastMoveX = 0;
    let lastMoveY = 0;
    let momentumAnimation = null;
    
    // Zmienne do żyroskopu
    let gyroEnabled = false;
    let gyroAnimation = null;
    let targetGyroX = 0;
    let targetGyroY = 0;
    let currentGyroX = 0;
    let currentGyroY = 0;
    
    // Maksymalna skala (z konfiguracji)
    const MAX_SCALE = MENU_CONFIG.zoom.maxScale;
    
    // Minimalna skala będzie obliczona dynamicznie, aby zawsze wypełniać ekran
    let MIN_SCALE = 1;
    
    // Rozmiary obrazu i kontenera
    let imageWidth = 0;
    let imageHeight = 0;
    let containerWidth = 0;
    let containerHeight = 0;
    
    // Inicjalizacja po załadowaniu obrazu
    menuImage.onload = function() {
        imageWidth = menuImage.naturalWidth;
        imageHeight = menuImage.naturalHeight;
        updateContainerSize();
        resetView();
        
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, MENU_CONFIG.animation.preloaderDelay);
    };
    
    // Jeśli obraz jest już załadowany (cache)
    if (menuImage.complete) {
        menuImage.onload();
    }
    
    // Obsługa błędu ładowania
    menuImage.onerror = function() {
        console.error('Błąd ładowania obrazu');
        preloader.classList.add('hidden');
    };
    
    // Aktualizacja rozmiarów kontenera
    function updateContainerSize() {
        containerWidth = menuContainer.clientWidth;
        containerHeight = menuContainer.clientHeight;
    }
    
    // Resetowanie widoku - dopasowanie obrazu do ekranu
    function resetView() {
        updateContainerSize();
        
        const config = MENU_CONFIG.initialView;
        
        // Oblicz minimalną skalę, aby obraz zawsze wypełniał ekran
        const scaleX = containerWidth / imageWidth;
        const scaleY = containerHeight / imageHeight;
        MIN_SCALE = Math.max(scaleX, scaleY);
        
        // Oblicz skalę bazową (100% = cały obraz wypełnia wysokość ekranu)
        const baseScale = containerHeight / imageHeight;
        
        // Zastosuj procent skali z konfiguracji
        // scalePercent: 100 = cały obraz, 60 = widoczne 60% obrazu (powiększone)
        // Ale nigdy nie pozwól na skalę mniejszą niż MIN_SCALE
        scale = Math.max(MIN_SCALE, baseScale * (100 / config.scalePercent));
        
        // Ustal punkt fokusa (który punkt obrazu ma być widoczny)
        let focusX = config.focusX;
        let focusY = config.focusY;
        
        // Jeśli ustawiono predefiniowaną pozycję, nadpisz focusX i focusY
        if (config.position) {
            const positions = {
                'top-left': { x: 0, y: 0 },
                'top-center': { x: 50, y: 0 },
                'top-right': { x: 100, y: 0 },
                'center-left': { x: 0, y: 50 },
                'center': { x: 50, y: 50 },
                'center-right': { x: 100, y: 50 },
                'bottom-left': { x: 0, y: 100 },
                'bottom-center': { x: 50, y: 100 },
                'bottom-right': { x: 100, y: 100 }
            };
            if (positions[config.position]) {
                focusX = positions[config.position].x;
                focusY = positions[config.position].y;
            }
        }
        
        // Oblicz pozycję punktu fokusa na obrazie (w pikselach)
        const focusPointX = (focusX / 100) * imageWidth;
        const focusPointY = (focusY / 100) * imageHeight;
        
        // Oblicz pozycję obrazu tak, aby punkt fokusa był widoczny
        // Domyślnie umieść punkt fokusa w lewym górnym rogu ekranu
        translateX = -focusPointX * scale;
        translateY = -focusPointY * scale;
        
        updateTransform();
    }
    
    // Ograniczenie przesunięcia, aby nie pokazywać tła
    function limitTranslate() {
        const scaledWidth = imageWidth * scale;
        const scaledHeight = imageHeight * scale;
        
        // Ograniczenia dla osi X
        // Lewy górny róg nie może być > 0
        // Prawy dolny róg nie może być < containerWidth
        const minX = containerWidth - scaledWidth; // maksymalne przesunięcie w lewo
        const maxX = 0; // maksymalne przesunięcie w prawo
        
        if (scaledWidth > containerWidth) {
            // Obraz szerszy niż kontener - ogranicz przesunięcie
            translateX = Math.max(minX, Math.min(maxX, translateX));
        } else {
            // Obraz węższy - wyśrodkuj i nie pozwól na przesuwanie
            translateX = (containerWidth - scaledWidth) / 2;
        }
        
        // Ograniczenia dla osi Y
        const minY = containerHeight - scaledHeight;
        const maxY = 0;
        
        if (scaledHeight > containerHeight) {
            // Obraz wyższy niż kontener - ogranicz przesunięcie
            translateY = Math.max(minY, Math.min(maxY, translateY));
        } else {
            // Obraz niższy - wyśrodkuj i nie pozwól na przesuwanie
            translateY = (containerHeight - scaledHeight) / 2;
        }
    }
    
    // Aktualizacja transformacji - transformujemy cały wrapper (obraz + hotspoty razem)
    function updateTransform(smooth = false) {
        limitTranslate();
        
        // Dodaj płynne przejście jeśli włączone w konfiguracji
        if (smooth && MENU_CONFIG.animation.smoothTransition) {
            menuImageWrapper.style.transition = `transform ${MENU_CONFIG.animation.transitionDuration}s ease-out`;
        } else {
            menuImageWrapper.style.transition = 'none';
        }
        
        // Transformuj cały wrapper - obraz i hotspoty poruszają się razem jako jeden element
        menuImageWrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    
    // Zoom w określonym punkcie
    function zoomAtPoint(clientX, clientY, newScale, smooth = true) {
        newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        
        const rect = menuContainer.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        // Punkt na obrazie przed zoomem
        const imageX = (x - translateX) / scale;
        const imageY = (y - translateY) / scale;
        
        // Nowa pozycja po zoomie
        translateX = x - imageX * newScale;
        translateY = y - imageY * newScale;
        scale = newScale;
        
        updateTransform(smooth);
    }
    
    // Obsługa przycisków zoom
    zoomInBtn.addEventListener('click', function() {
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        zoomAtPoint(centerX + menuContainer.getBoundingClientRect().left, 
                    centerY + menuContainer.getBoundingClientRect().top, 
                    scale * MENU_CONFIG.zoom.step);
    });
    
    zoomOutBtn.addEventListener('click', function() {
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        zoomAtPoint(centerX + menuContainer.getBoundingClientRect().left, 
                    centerY + menuContainer.getBoundingClientRect().top, 
                    scale / MENU_CONFIG.zoom.step);
    });
    
    resetViewBtn.addEventListener('click', resetView);
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Obsługa przeciągania myszą
    menuContainer.addEventListener('mousedown', function(e) {
        // Zatrzymaj momentum scrolling
        if (momentumAnimation) {
            cancelAnimationFrame(momentumAnimation);
            momentumAnimation = null;
        }
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startTranslateX = translateX;
        startTranslateY = translateY;
        lastMoveX = e.clientX;
        lastMoveY = e.clientY;
        lastMoveTime = Date.now();
        velocityX = 0;
        velocityY = 0;
        menuContainer.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        translateX = startTranslateX + dx;
        translateY = startTranslateY + dy;
        
        // Oblicz prędkość dla momentum scrolling
        const now = Date.now();
        const dt = now - lastMoveTime;
        if (dt > 0) {
            velocityX = (e.clientX - lastMoveX) / dt * 16; // normalizacja do 60fps
            velocityY = (e.clientY - lastMoveY) / dt * 16;
        }
        lastMoveX = e.clientX;
        lastMoveY = e.clientY;
        lastMoveTime = now;
        
        updateTransform();
    });
    
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            menuContainer.style.cursor = 'grab';
            
            // Uruchom momentum scrolling jeśli włączone
            if (MENU_CONFIG.animation.momentum) {
                startMomentum();
            }
        }
    });
    
    // Obsługa kółka myszy
    let wheelTimeout;
    menuContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        // Zatrzymaj momentum scrolling podczas zoomowania
        if (momentumAnimation) {
            cancelAnimationFrame(momentumAnimation);
            momentumAnimation = null;
        }
        
        const delta = e.deltaY > 0 ? (1 - MENU_CONFIG.zoom.wheelSensitivity) : (1 + MENU_CONFIG.zoom.wheelSensitivity);
        
        // Użyj płynnego zoomowania dla pierwszego ruchu kółka
        // Następne ruchy będą bez animacji dla lepszej responsywności
        clearTimeout(wheelTimeout);
        const useSmooth = !wheelTimeout;
        zoomAtPoint(e.clientX, e.clientY, scale * delta, useSmooth);
        
        // Reset timeout
        wheelTimeout = setTimeout(() => {
            wheelTimeout = null;
        }, 150);
    });
    
    // Obsługa dotyku (mobile)
    let touchStartDistance = 0;
    let touchStartScale = 1;
    
    menuContainer.addEventListener('touchstart', function(e) {
        // Zatrzymaj momentum scrolling
        if (momentumAnimation) {
            cancelAnimationFrame(momentumAnimation);
            momentumAnimation = null;
        }
        
        if (e.touches.length === 1) {
            // Pojedynczy dotyk - przeciąganie
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTranslateX = translateX;
            startTranslateY = translateY;
            lastMoveX = e.touches[0].clientX;
            lastMoveY = e.touches[0].clientY;
            lastMoveTime = Date.now();
            velocityX = 0;
            velocityY = 0;
        } else if (e.touches.length === 2) {
            // Dwa dotyki - pinch zoom
            isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            touchStartDistance = Math.sqrt(dx * dx + dy * dy);
            touchStartScale = scale;
        }
        e.preventDefault();
    }, { passive: false });
    
    menuContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1 && isDragging) {
            // Przeciąganie
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            
            translateX = startTranslateX + dx;
            translateY = startTranslateY + dy;
            
            // Oblicz prędkość dla momentum scrolling
            const now = Date.now();
            const dt = now - lastMoveTime;
            if (dt > 0) {
                velocityX = (e.touches[0].clientX - lastMoveX) / dt * 16;
                velocityY = (e.touches[0].clientY - lastMoveY) / dt * 16;
            }
            lastMoveX = e.touches[0].clientX;
            lastMoveY = e.touches[0].clientY;
            lastMoveTime = now;
            
            updateTransform();
        } else if (e.touches.length === 2) {
            // Pinch zoom
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            
            const newScale = touchStartScale * (distance / touchStartDistance);
            zoomAtPoint(centerX, centerY, newScale, false); // Bez animacji dla responsywności
        }
        e.preventDefault();
    }, { passive: false });
    
    menuContainer.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            
            // Uruchom momentum scrolling jeśli włączone
            if (MENU_CONFIG.animation.momentum) {
                startMomentum();
            }
        }
    });
    
    // Aktualizacja przy zmianie rozmiaru okna
    window.addEventListener('resize', function() {
        updateContainerSize();
        updateTransform();
    });
    
    // Obsługa żyroskopu
    function handleGyroscope(event) {
        if (!gyroEnabled || isDragging) return;
        
        const config = MENU_CONFIG.gyroscope;
        
        // beta: przechylenie przód-tył (-180 do 180)
        // gamma: przechylenie lewo-prawo (-90 do 90)
        const beta = event.beta;   // góra-dół
        const gamma = event.gamma; // lewo-prawo
        
        // Oblicz przesunięcie na podstawie przechylenia
        // Naturalne kierunki:
        // Przechyl w prawo → obraz przesuwa się w prawo (pokazuje lewą stronę)
        // Przechyl w lewo → obraz przesuwa się w lewo (pokazuje prawą stronę)
        // Podnieś telefon → obraz spada w dół (pokazuje górę)
        // Opuść telefon → obraz idzie w górę (pokazuje dół)
        targetGyroX = gamma * config.sensitivity * 2;
        targetGyroY = beta * config.sensitivity * 2;
    }
    
    function startGyroAnimation() {
        if (gyroAnimation) return;
        
        const config = MENU_CONFIG.gyroscope;
        
        function animate() {
            if (!gyroEnabled) {
                gyroAnimation = null;
                return;
            }
            
            // Wygładzanie ruchu (lerp)
            currentGyroX += (targetGyroX - currentGyroX) * config.smoothing;
            currentGyroY += (targetGyroY - currentGyroY) * config.smoothing;
            
            // Zastosuj przesunięcie
            translateX += currentGyroX;
            translateY += currentGyroY;
            
            updateTransform();
            
            gyroAnimation = requestAnimationFrame(animate);
        }
        
        gyroAnimation = requestAnimationFrame(animate);
    }
    
    function enableGyroscope() {
        if (typeof DeviceOrientationEvent === 'undefined') {
            alert('Twoje urządzenie nie obsługuje żyroskopu');
            return;
        }
        
        // iOS 13+ wymaga uprawnienia
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Pokaż informację dla użytkowników iOS
            const isFirstTime = !localStorage.getItem('gyro_permission_asked');
            if (isFirstTime) {
                alert('Za chwilę pojawi się prośba o dostęp do czujnika ruchu. Kliknij "Zezwól" aby włączyć sterowanie żyroskopem.');
                localStorage.setItem('gyro_permission_asked', 'true');
            }
            
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        activateGyroscope();
                    } else {
                        alert('Aby włączyć żyroskop, musisz udzielić uprawnienia.\n\nJeśli odrzuciłeś uprawnienie:\n1. Otwórz Ustawienia iPhone\n2. Safari → Prywatność i bezpieczeństwo\n3. Ruch i orientacja → Włącz\n4. Odśwież stronę i spróbuj ponownie');
                    }
                })
                .catch(err => {
                    console.error('Błąd żyroskopu:', err);
                    alert('Nie udało się włączyć żyroskopu. Sprawdź ustawienia Safari.');
                });
        } else {
            activateGyroscope();
        }
    }
    
    function activateGyroscope() {
        gyroEnabled = true;
        window.addEventListener('deviceorientation', handleGyroscope);
        startGyroAnimation();
        
        // Zaktualizuj przycisk
        const gyroBtn = document.getElementById('gyroBtn');
        if (gyroBtn) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = '📱✓';
        }
    }
    
    function disableGyroscope() {
        gyroEnabled = false;
        window.removeEventListener('deviceorientation', handleGyroscope);
        
        if (gyroAnimation) {
            cancelAnimationFrame(gyroAnimation);
            gyroAnimation = null;
        }
        
        currentGyroX = 0;
        currentGyroY = 0;
        targetGyroX = 0;
        targetGyroY = 0;
        
        // Zaktualizuj przycisk
        const gyroBtn = document.getElementById('gyroBtn');
        if (gyroBtn) {
            gyroBtn.classList.remove('active');
            gyroBtn.textContent = '📱';
        }
    }
    
    function toggleGyroscope() {
        if (gyroEnabled) {
            disableGyroscope();
        } else {
            enableGyroscope();
        }
    }
    
    // Obsługa hotspotów
    let hotspotsData = [];
    
    async function loadHotspots() {
        if (!MENU_CONFIG.hotspots.enabled) return;
        
        try {
            const response = await fetch(MENU_CONFIG.hotspots.dataFile);
            hotspotsData = await response.json();
            createHotspots();
        } catch (error) {
            console.error('Błąd ładowania hotspotów:', error);
        }
    }
    
    function createHotspots() {
        const container = document.getElementById('hotspotsContainer');
        container.innerHTML = '';
        
        hotspotsData.forEach(hotspot => {
            const div = document.createElement('div');
            div.className = 'hotspot';
            div.id = `hotspot-${hotspot.id}`;
            div.title = hotspot.name;
            
            // Ustaw pozycję i rozmiar (w procentach obrazu)
            div.style.left = `${hotspot.x}%`;
            div.style.top = `${hotspot.y}%`;
            div.style.width = `${hotspot.width}%`;
            div.style.height = `${hotspot.height}%`;
            
            // Dodaj efekt hover
            if (MENU_CONFIG.hotspots.showOnHover) {
                div.addEventListener('mouseenter', function() {
                    this.style.backgroundColor = 'rgba(201, 166, 107, 0.6)';
                });
                div.addEventListener('mouseleave', function() {
                    this.style.backgroundColor = 'rgba(201, 166, 107, 0.3)';
                });
            }
            
            // Obsługa kliknięcia
            div.addEventListener('click', function(e) {
                e.stopPropagation();
                openHotspot(hotspot);
            });
            
            container.appendChild(div);
        });
    }
    
    function openHotspot(hotspot) {
        if (MENU_CONFIG.hotspots.openInNewTab) {
            window.open(hotspot.page, '_blank');
        } else {
            // Modal - zaimplementujemy później jeśli potrzeba
            window.location.href = hotspot.page;
        }
    }
    
    // Załaduj hotspoty po załadowaniu obrazu
    menuImage.addEventListener('load', loadHotspots);
    if (menuImage.complete) {
        loadHotspots();
    }
    
    // Obsługa fullscreen
    function toggleFullscreen() {
        const viewer = document.getElementById('menuViewer');
        
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            // Wejdź w fullscreen
            if (viewer.requestFullscreen) {
                viewer.requestFullscreen();
            } else if (viewer.webkitRequestFullscreen) { // Safari
                viewer.webkitRequestFullscreen();
            } else if (viewer.mozRequestFullScreen) { // Firefox
                viewer.mozRequestFullScreen();
            } else if (viewer.msRequestFullscreen) { // IE/Edge
                viewer.msRequestFullscreen();
            }
        } else {
            // Wyjdź z fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
    
    // Aktualizuj ikonę przycisku fullscreen
    function updateFullscreenButton() {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement) {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.classList.add('active');
            fullscreenBtn.title = 'Wyjdź z pełnego ekranu';
        } else {
            fullscreenBtn.textContent = '⛶';
            fullscreenBtn.classList.remove('active');
            fullscreenBtn.title = 'Pełny ekran';
        }
    }
    
    // Nasłuchuj zmian fullscreen
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('msfullscreenchange', updateFullscreenButton);
    
    // Dodaj przycisk żyroskopu (tylko na mobile)
    function createGyroButton() {
        if (!MENU_CONFIG.gyroscope.enabled) return;
        if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) return;
        
        const gyroBtn = document.createElement('button');
        gyroBtn.id = 'gyroBtn';
        gyroBtn.className = 'control-btn';
        gyroBtn.textContent = '📱';
        gyroBtn.title = 'Włącz/wyłącz sterowanie żyroskopem';
        gyroBtn.addEventListener('click', toggleGyroscope);
        
        document.querySelector('.menu-controls').appendChild(gyroBtn);
        
        // Auto-enable jeśli ustawione w konfiguracji
        if (MENU_CONFIG.gyroscope.autoEnable) {
            setTimeout(() => enableGyroscope(), 1000);
        }
    }
    
    // Momentum scrolling (inercja)
    function startMomentum() {
        const friction = MENU_CONFIG.animation.momentumFriction;
        const minVelocity = 0.1; // Minimalna prędkość, poniżej której zatrzymujemy animację
        
        function animate() {
            // Zastosuj tarcie
            velocityX *= friction;
            velocityY *= friction;
            
            // Zatrzymaj animację jeśli prędkość jest bardzo mała
            if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) {
                momentumAnimation = null;
                return;
            }
            
            // Zaktualizuj pozycję
            translateX += velocityX;
            translateY += velocityY;
            
            updateTransform();
            
            // Kontynuuj animację
            momentumAnimation = requestAnimationFrame(animate);
        }
        
        // Rozpocznij animację tylko jeśli prędkość jest wystarczająca
        if (Math.abs(velocityX) > minVelocity || Math.abs(velocityY) > minVelocity) {
            momentumAnimation = requestAnimationFrame(animate);
        }
    }
    
    // Inicjalizacja po załadowaniu obrazu
    menuImage.addEventListener('load', function() {
        updateContainerSize();
        resetView();
        
        // Ukryj preloader
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, MENU_CONFIG.animation.preloaderDelay);
    });
    
    // Jeśli obraz już załadowany (cache)
    if (menuImage.complete) {
        updateContainerSize();
        resetView();
        
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, MENU_CONFIG.animation.preloaderDelay);
    }
    
    // Ustaw początkowy kursor
    menuContainer.style.cursor = 'grab';
    
    // Dodaj przycisk żyroskopu na urządzeniach mobilnych
    createGyroButton();
});
