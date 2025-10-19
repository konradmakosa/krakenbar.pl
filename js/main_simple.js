// Prosty viewer - tylko obraz + hotspoty, bez animacji
console.log('=== main_simple.js START ===');
console.log('MENU_CONFIG:', MENU_CONFIG);
console.log('document.readyState:', document.readyState);

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== SIMPLE VIEWER START ===');
    
    const menuContainer = document.getElementById('menuContainer');
    const menuImageWrapper = document.getElementById('menuImageWrapper');
    const menuImage = document.getElementById('menuImage');
    const preloader = document.getElementById('preloader');
    
    // Ustaw źródło obrazu z konfiguracji
    if (menuImage && MENU_CONFIG && MENU_CONFIG.image && MENU_CONFIG.image.path) {
        menuImage.src = MENU_CONFIG.image.path;
        menuImage.alt = MENU_CONFIG.image.alt || 'Menu';
    }
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetViewBtn = document.getElementById('resetView');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    
    // Wymiary obrazu z konfiguracji
    const imageWidth = MENU_CONFIG.image.width;
    const imageHeight = MENU_CONFIG.image.height;
    
    // Zmienne do przechowywania stanu
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startTranslateX = 0;
    let startTranslateY = 0;
    let lastTouchDistance = 0;
    
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
    
    // Maksymalna i minimalna skala
    const MAX_SCALE = MENU_CONFIG.zoom.maxScale;
    let MIN_SCALE = 1;
    
    console.log('Image dimensions:', imageWidth, 'x', imageHeight);
    
    // Ustaw wymiary obrazu
    menuImage.style.width = imageWidth + 'px';
    menuImage.style.height = imageHeight + 'px';
    
    // Oblicz skalę (60% = widoczne 60% wysokości obrazu)
    let containerHeight = menuContainer.clientHeight;
    let containerWidth = menuContainer.clientWidth;
    
    console.log('Container dimensions:', containerWidth, 'x', containerHeight);
    
    // Skala bazowa: obraz wypełnia szerokość kontenera (dla wąskich, wysokich obrazów)
    const baseScale = containerWidth / imageWidth;
    
    // Zastosuj procent skali (100% = pełna szerokość)
    const scalePercent = MENU_CONFIG.initialView.scalePercent;
    scale = baseScale * (100 / scalePercent);
    
    // Oblicz minimalną skalę
    MIN_SCALE = Math.max(containerWidth / imageWidth, containerHeight / imageHeight);
    
    console.log('Base scale:', baseScale);
    console.log('Scale percent:', scalePercent);
    console.log('Final scale:', scale);
    console.log('MIN_SCALE:', MIN_SCALE, 'MAX_SCALE:', MAX_SCALE);
    
    // Funkcja aktualizacji transformacji
    function updateTransform(smooth = false) {
        // Ogranicz przesunięcie
        const scaledWidth = imageWidth * scale;
        const scaledHeight = imageHeight * scale;
        
        const minX = containerWidth - scaledWidth;
        const maxX = 0;
        const minY = containerHeight - scaledHeight;
        const maxY = 0;
        
        if (scaledWidth > containerWidth) {
            translateX = Math.max(minX, Math.min(maxX, translateX));
        } else {
            translateX = (containerWidth - scaledWidth) / 2;
        }
        
        if (scaledHeight > containerHeight) {
            translateY = Math.max(minY, Math.min(maxY, translateY));
        } else {
            translateY = (containerHeight - scaledHeight) / 2;
        }
        
        // Dodaj płynne przejście jeśli włączone
        if (smooth && MENU_CONFIG.animation.smoothTransition) {
            menuImageWrapper.style.transition = `transform ${MENU_CONFIG.animation.transitionDuration}s ease-out`;
        } else {
            menuImageWrapper.style.transition = 'none';
        }
        
        menuImageWrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }
    
    updateTransform();
    console.log('Transform:', menuImageWrapper.style.transform);
    
    // Obsługa przeciągania myszą
    menuContainer.addEventListener('mousedown', function(e) {
        if (!MENU_CONFIG.interaction.enableMouseDrag) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startTranslateX = translateX;
        startTranslateY = translateY;
        menuContainer.style.cursor = 'grabbing';
        e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        translateX = startTranslateX + dx;
        translateY = startTranslateY + dy;
        
        // Oblicz prędkość dla momentum
        const now = Date.now();
        if (lastMoveTime > 0) {
            const dt = now - lastMoveTime;
            if (dt > 0) {
                velocityX = (e.clientX - lastMoveX) / dt * 16; // Normalizuj do 60fps
                velocityY = (e.clientY - lastMoveY) / dt * 16;
            }
        }
        lastMoveTime = now;
        lastMoveX = e.clientX;
        lastMoveY = e.clientY;
        
        updateTransform();
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            menuContainer.style.cursor = 'grab';
            
            // Rozpocznij momentum scrolling
            if (MENU_CONFIG.animation.momentum) {
                startMomentum();
            }
            
            // Reset zmiennych
            lastMoveTime = 0;
        }
    });
    
    // Momentum scrolling (inercja)
    function startMomentum() {
        const friction = MENU_CONFIG.animation.momentumFriction;
        const minVelocity = 0.1;
        
        // Anuluj poprzednią animację
        if (momentumAnimation) {
            cancelAnimationFrame(momentumAnimation);
        }
        
        function animate() {
            // Zastosuj tarcie
            velocityX *= friction;
            velocityY *= friction;
            
            // Zatrzymaj animację jeśli prędkość jest bardzo mała
            if (Math.abs(velocityX) < minVelocity && Math.abs(velocityY) < minVelocity) {
                momentumAnimation = null;
                velocityX = 0;
                velocityY = 0;
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
    
    // Obsługa przeciągania dotykiem
    menuContainer.addEventListener('touchstart', function(e) {
        if (!MENU_CONFIG.interaction.enableTouchDrag) return;
        
        if (e.touches.length === 1) {
            isDragging = true;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTranslateX = translateX;
            startTranslateY = translateY;
        } else if (e.touches.length === 2 && MENU_CONFIG.interaction.enablePinchZoom) {
            isDragging = false;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        }
    });
    
    menuContainer.addEventListener('touchmove', function(e) {
        if (e.touches.length === 1 && isDragging) {
            const dx = e.touches[0].clientX - startX;
            const dy = e.touches[0].clientY - startY;
            
            translateX = startTranslateX + dx;
            translateY = startTranslateY + dy;
            
            // Oblicz prędkość dla momentum
            const now = Date.now();
            if (lastMoveTime > 0) {
                const dt = now - lastMoveTime;
                if (dt > 0) {
                    velocityX = (e.touches[0].clientX - lastMoveX) / dt * 16;
                    velocityY = (e.touches[0].clientY - lastMoveY) / dt * 16;
                }
            }
            lastMoveTime = now;
            lastMoveX = e.touches[0].clientX;
            lastMoveY = e.touches[0].clientY;
            
            updateTransform();
            e.preventDefault();
        } else if (e.touches.length === 2 && MENU_CONFIG.interaction.enablePinchZoom) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (lastTouchDistance > 0) {
                const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                
                const scaleChange = distance / lastTouchDistance;
                const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * scaleChange));
                
                // Zoom w punkcie środkowym między palcami
                const rect = menuContainer.getBoundingClientRect();
                const x = centerX - rect.left;
                const y = centerY - rect.top;
                
                const imageX = (x - translateX) / scale;
                const imageY = (y - translateY) / scale;
                
                translateX = x - imageX * newScale;
                translateY = y - imageY * newScale;
                scale = newScale;
                
                updateTransform();
            }
            
            lastTouchDistance = distance;
            e.preventDefault();
        }
    });
    
    menuContainer.addEventListener('touchend', function() {
        if (isDragging && MENU_CONFIG.animation.momentum) {
            startMomentum();
        }
        
        isDragging = false;
        lastTouchDistance = 0;
        lastMoveTime = 0;
    });
    
    // Obsługa przycisków zoom
    zoomInBtn.addEventListener('click', function() {
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        const imageX = (centerX - translateX) / scale;
        const imageY = (centerY - translateY) / scale;
        
        scale = Math.min(MAX_SCALE, scale * MENU_CONFIG.zoom.step);
        
        translateX = centerX - imageX * scale;
        translateY = centerY - imageY * scale;
        
        updateTransform(true); // Płynne przejście
    });
    
    zoomOutBtn.addEventListener('click', function() {
        const centerX = containerWidth / 2;
        const centerY = containerHeight / 2;
        
        const imageX = (centerX - translateX) / scale;
        const imageY = (centerY - translateY) / scale;
        
        scale = Math.max(MIN_SCALE, scale / MENU_CONFIG.zoom.step);
        
        translateX = centerX - imageX * scale;
        translateY = centerY - imageY * scale;
        
        updateTransform(true); // Płynne przejście
    });
    
    // Przycisk reset
    resetViewBtn.addEventListener('click', function() {
        const currentBaseScale = containerWidth / imageWidth;
        const currentScalePercent = MENU_CONFIG.initialView.scalePercent;
        scale = currentBaseScale * (100 / currentScalePercent);
        translateX = 0;
        translateY = 0;
        updateTransform(true); // Płynne przejście
    });
    
    // Obsługa zoom kółkiem myszy
    menuContainer.addEventListener('wheel', function(e) {
        if (!MENU_CONFIG.interaction.enableMouseWheel) return;
        
        e.preventDefault();
        
        const delta = -e.deltaY;
        const zoomFactor = 1 + (delta * MENU_CONFIG.zoom.wheelSensitivity / 100);
        const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * zoomFactor));
        
        // Zoom w punkcie kursora
        const rect = menuContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const imageX = (x - translateX) / scale;
        const imageY = (y - translateY) / scale;
        
        translateX = x - imageX * newScale;
        translateY = y - imageY * newScale;
        scale = newScale;
        
        updateTransform();
    }, { passive: false });
    
    // Ustaw początkowy kursor
    menuContainer.style.cursor = 'grab';
    
    // Żyroskop
    function enableGyroscope() {
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        startGyroscope();
                    }
                })
                .catch(console.error);
        } else {
            startGyroscope();
        }
    }
    
    function startGyroscope() {
        gyroEnabled = true;
        window.addEventListener('deviceorientation', handleGyroscope);
        
        const gyroBtn = document.getElementById('gyroBtn');
        if (gyroBtn) {
            gyroBtn.classList.add('active');
            gyroBtn.textContent = '📱✓';
        }
        
        animateGyro();
    }
    
    function handleGyroscope(event) {
        if (!gyroEnabled) return;
        
        const gamma = event.gamma; // Lewo-prawo (-90 do 90)
        const beta = event.beta;   // Przód-tył (-180 do 180)
        
        const sensitivity = MENU_CONFIG.gyroscope.sensitivity;
        
        targetGyroX = gamma * sensitivity;
        targetGyroY = beta * sensitivity; // Podnieś telefon = obraz idzie w górę
    }
    
    function animateGyro() {
        if (!gyroEnabled) return;
        
        const smoothing = MENU_CONFIG.gyroscope.smoothing;
        
        currentGyroX += (targetGyroX - currentGyroX) * smoothing;
        currentGyroY += (targetGyroY - currentGyroY) * smoothing;
        
        translateX += currentGyroX;
        translateY += currentGyroY;
        
        updateTransform();
        
        gyroAnimation = requestAnimationFrame(animateGyro);
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
        
        if (MENU_CONFIG.gyroscope.autoEnable) {
            setTimeout(() => enableGyroscope(), 1000);
        }
    }
    
    // Fullscreen
    function toggleFullscreen() {
        const viewer = document.getElementById('menuViewer');
        
        if (!document.fullscreenElement && 
            !document.webkitFullscreenElement && 
            !document.mozFullScreenElement && 
            !document.msFullscreenElement) {
            if (viewer.requestFullscreen) {
                viewer.requestFullscreen();
            } else if (viewer.webkitRequestFullscreen) {
                viewer.webkitRequestFullscreen();
            } else if (viewer.mozRequestFullScreen) {
                viewer.mozRequestFullScreen();
            } else if (viewer.msRequestFullscreen) {
                viewer.msRequestFullscreen();
            }
        } else {
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
    
    function updateFullscreenButton() {
        if (document.fullscreenElement || 
            document.webkitFullscreenElement || 
            document.mozFullScreenElement || 
            document.msFullscreenElement) {
            fullscreenBtn.classList.add('active');
            fullscreenBtn.title = 'Wyjdź z pełnego ekranu';
        } else {
            fullscreenBtn.classList.remove('active');
            fullscreenBtn.title = 'Pełny ekran';
        }
    }
    
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('msfullscreenchange', updateFullscreenButton);
    
    // Inicjalizuj przycisk żyroskopu
    createGyroButton();
    
    // Animowany Kraken - pojawia się tylko przy bezczynności
    let lastActivityTime = Date.now();
    let krakenInterval = null;
    let isInactive = false;
    
    function resetActivity() {
        lastActivityTime = Date.now();
        
        // Jeśli był nieaktywny, zatrzymaj krakena
        if (isInactive) {
            isInactive = false;
            const kraken = document.getElementById('krakenAnimation');
            kraken.classList.remove('show');
            
            if (krakenInterval) {
                clearInterval(krakenInterval);
                krakenInterval = null;
            }
        }
    }
    
    function showKraken() {
        const kraken = document.getElementById('krakenAnimation');
        const img = kraken.querySelector('img');
        
        // Zrestartuj animację GIF od początku
        const src = img.src;
        img.src = '';
        img.src = src;
        
        kraken.classList.add('show');
        
        // Schowaj po 5 sekundach (długość animacji GIF)
        setTimeout(() => {
            kraken.classList.remove('show');
        }, 5000);
    }
    
    function checkInactivity() {
        const inactiveTime = Date.now() - lastActivityTime;
        
        // Jeśli bezczynność > 10 sekund
        if (inactiveTime > 10000 && !isInactive) {
            isInactive = true;
            console.log('Bezczynność - uruchamiam czołg');
            
            // Pokaż krakena od razu
            showKraken();
            
            // Powtarzaj co 10 sekund (5 sek pokazany + 5 sek przerwa)
            krakenInterval = setInterval(() => {
                if (isInactive) {
                    showKraken();
                }
            }, 10000);
        }
    }
    
    // Sprawdzaj bezczynność co sekundę
    setInterval(checkInactivity, 1000);
    
    // Resetuj licznik przy jakiejkolwiek aktywności
    document.addEventListener('mousedown', resetActivity);
    document.addEventListener('mousemove', resetActivity);
    document.addEventListener('touchstart', resetActivity);
    document.addEventListener('touchmove', resetActivity);
    document.addEventListener('wheel', resetActivity);
    document.addEventListener('keydown', resetActivity);
    
    // Załaduj hotspoty
    async function loadHotspots() {
        if (!MENU_CONFIG.hotspots.enabled) {
            console.log('Hotspots disabled');
            return;
        }
        
        try {
            console.log('Loading hotspots from:', MENU_CONFIG.hotspots.dataFile);
            const response = await fetch(MENU_CONFIG.hotspots.dataFile);
            const hotspotsData = await response.json();
            console.log('Hotspots loaded:', hotspotsData.length);
            createHotspots(hotspotsData);
        } catch (error) {
            console.error('Error loading hotspots:', error);
        }
    }
    
    function createHotspots(hotspotsData) {
        const container = document.getElementById('hotspotsContainer');
        container.innerHTML = '';
        
        hotspotsData.forEach(hotspot => {
            const div = document.createElement('div');
            div.className = 'hotspot';
            div.id = `hotspot-${hotspot.id}`;
            div.title = hotspot.name;
            
            // Format pikselowy (x1, y1, x2, y2) - konwertuj na procenty
            const x = (hotspot.x1 / imageWidth) * 100;
            const y = (hotspot.y1 / imageHeight) * 100;
            const width = ((hotspot.x2 - hotspot.x1) / imageWidth) * 100;
            const height = ((hotspot.y2 - hotspot.y1) / imageHeight) * 100;
            
            div.style.left = `${x}%`;
            div.style.top = `${y}%`;
            div.style.width = `${width}%`;
            div.style.height = `${height}%`;
            
            console.log(`Hotspot: ${hotspot.name} at (${hotspot.x1}, ${hotspot.y1}) → (${hotspot.x2}, ${hotspot.y2}) = ${x.toFixed(2)}%, ${y.toFixed(2)}%, ${width.toFixed(2)}%, ${height.toFixed(2)}%`);
            
            // Brak żółtego tła - tylko biała ramka w CSS
            
            // Obsługa kliknięcia
            div.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                console.log('Hotspot clicked:', hotspot.name, hotspot.page);
                
                // Dodaj efekt wizualny kliknięcia
                div.classList.add('clicked');
                setTimeout(() => {
                    div.classList.remove('clicked');
                }, 300);
                
                if (MENU_CONFIG.hotspots.openInNewTab) {
                    window.open(hotspot.page, '_blank');
                } else {
                    // Otwórz w modalu z iframe
                    openPageModal(hotspot.page);
                }
            });
            
            // Debug - sprawdź czy hotspot jest klikalny
            console.log(`Hotspot ${hotspot.name} created with pointer-events: auto`);
            
            container.appendChild(div);
        });
        
        console.log('Hotspots created:', hotspotsData.length);
        
        // Animuj hotspoty po kolei
        animateHotspotsSequence();
    }
    
    function animateHotspotsSequence() {
        // Sprawdź czy animacja jest włączona
        if (!MENU_CONFIG.hotspots.animation || !MENU_CONFIG.hotspots.animation.enabled) {
            console.log('Hotspot animation disabled');
            return;
        }
        
        const hotspotElements = document.querySelectorAll('.hotspot');
        const animationDuration = MENU_CONFIG.hotspots.animation.duration || 500;
        const overlap = MENU_CONFIG.hotspots.animation.overlap || 50;
        const delay = animationDuration - overlap;
        
        hotspotElements.forEach((hotspot, index) => {
            setTimeout(() => {
                hotspot.classList.add('reveal');
                
                // Usuń klasę po zakończeniu animacji
                setTimeout(() => {
                    hotspot.classList.remove('reveal');
                }, animationDuration);
            }, index * delay);
        });
        
        // Powtarzaj zgodnie z konfiguracją
        const repeatInterval = MENU_CONFIG.hotspots.animation.repeatInterval || 10000;
        setTimeout(() => {
            animateHotspotsSequence();
        }, repeatInterval);
    }
    
    // Inicjalizacja po załadowaniu obrazu
    menuImage.addEventListener('load', function() {
        console.log('Image loaded');
        loadHotspots();
        
        setTimeout(() => {
            preloader.classList.add('hidden');
            console.log('Preloader hidden');
        }, MENU_CONFIG.animation.preloaderDelay);
    });
    
    // Jeśli obraz już załadowany (cache)
    if (menuImage.complete) {
        console.log('Image already loaded (cache)');
        loadHotspots();
        
        setTimeout(() => {
            preloader.classList.add('hidden');
            console.log('Preloader hidden');
        }, MENU_CONFIG.animation.preloaderDelay);
    }
    
    console.log('=== SIMPLE VIEWER INITIALIZED ===');
    
    // Debug info
    setTimeout(() => {
        console.log('=== DEBUG INFO ===');
        console.log('Image width:', menuImage.style.width);
        console.log('Image height:', menuImage.style.height);
        console.log('Image complete:', menuImage.complete);
        console.log('Image naturalWidth:', menuImage.naturalWidth);
        console.log('Image naturalHeight:', menuImage.naturalHeight);
        console.log('Wrapper transform:', menuImageWrapper.style.transform);
        console.log('Wrapper transformOrigin:', menuImageWrapper.style.transformOrigin);
        console.log('Container computed width:', window.getComputedStyle(menuContainer).width);
        console.log('Container computed height:', window.getComputedStyle(menuContainer).height);
        console.log('Image src:', menuImage.src);
        console.log('Image display:', window.getComputedStyle(menuImage).display);
        console.log('Wrapper display:', window.getComputedStyle(menuImageWrapper).display);
        console.log('=================');
    }, 1000);
    
    // Obsługa modala z podstronami
    const pageModal = document.getElementById('pageModal');
    const pageFrame = document.getElementById('pageFrame');
    const pageModalClose = document.getElementById('pageModalClose');
    
    window.openPageModal = function(pageUrl) {
        pageFrame.src = pageUrl;
        pageModal.classList.add('active');
    };
    
    function closePageModal() {
        pageModal.classList.remove('active');
        pageFrame.src = '';
    }
    
    pageModalClose.addEventListener('click', closePageModal);
    
    // Zamknij modal przy kliknięciu w tło
    pageModal.addEventListener('click', function(e) {
        if (e.target === pageModal) {
            closePageModal();
        }
    });
});
