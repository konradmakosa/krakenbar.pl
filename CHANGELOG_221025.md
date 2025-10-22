# Zmiany w projekcie Beirut Bar - 21-22.10.2025

## 🎯 Cel zmian
1. Naprawienie migania obrazka zaslepki w stronach HTML
2. Naprawienie białej przerwy i przesunięcia na Firefox Mobile (Android)

---

## 📝 ZMIANY RĘCZNE (do skopiowania do drugiego projektu)

### 1. **css/style.css**

#### A) Usunięcie `position: fixed` z body (linia ~26-33)
```css
/* BYŁO: */
html, body {
    height: 100%;
    overflow: hidden;
    position: fixed;  /* ❌ USUŃ TO */
    width: 100%;
    touch-action: none;
    margin: 0;
    padding: 0;
}

/* JEST: */
html, body {
    height: 100%;
    overflow: hidden;
    width: 100%;
    touch-action: none;
    margin: 0;
    padding: 0;
}
```

#### B) Baner reklamowy - viewport fix (linia ~79-95)
```css
/* BYŁO: */
.ad-banner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 15vh;
    min-height: 100px;  /* ❌ USUŃ */
    background-color: #ffffff;
    ...
}

/* JEST: */
.ad-banner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 15vh; /* Fallback dla starych przeglądarek */
    height: 15dvh; /* Dynamic viewport height (nowoczesne) */
    height: calc(var(--vh, 1vh) * 15); /* JS fallback - MUSI BYĆ OSTATNI */
    background-color: #ffffff;
    ...
}
```

#### C) Link banera - usuń min-height (linia ~97-104)
```css
/* BYŁO: */
.ad-banner-link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    min-height: 100px;  /* ❌ USUŃ */
    text-decoration: none;
}

/* JEST: */
.ad-banner-link {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    text-decoration: none;
}
```

#### D) Obrazek banera - wymuszenie wysokości (linia ~106-117)
```css
/* BYŁO: */
.ad-banner-image {
    max-width: 100%;
    max-height: 15vh;
    width: auto;
    height: auto;
    object-fit: contain;
    ...
}

/* JEST: */
.ad-banner-image {
    max-width: 100%;
    width: auto;
    height: 15vh; /* Fallback dla starych przeglądarek */
    height: 15dvh; /* Dynamic viewport height (nowoczesne) */
    height: calc(var(--vh, 1vh) * 15); /* JS fallback - MUSI BYĆ OSTATNI */
    object-fit: contain;
    ...
}
```

#### E) Modal dla podstron - viewport fix (linia ~127-142)
```css
/* BYŁO: */
.page-modal {
    display: none;
    position: fixed;
    top: 15vh;
    left: 0;
    width: 100%;
    height: 85vh;
    ...
}

/* JEST: */
.page-modal {
    display: none;
    position: fixed;
    top: 15vh; /* Fallback dla starych przeglądarek */
    top: 15dvh; /* Dynamic viewport height (nowoczesne) */
    top: calc(var(--vh, 1vh) * 15); /* JS fallback - MUSI BYĆ OSTATNI */
    left: 0;
    width: 100%;
    height: 85vh; /* Fallback dla starych przeglądarek */
    height: 85dvh; /* Dynamic viewport height (nowoczesne) */
    height: calc(var(--vh, 1vh) * 85); /* JS fallback - MUSI BYĆ OSTATNI */
    ...
}
```

#### F) Menu Viewer - viewport fix (linia ~188-201)
```css
/* BYŁO: */
.menu-viewer {
    position: fixed;
    top: 15vh;
    left: 0;
    width: 100%;
    height: 85vh;
    ...
}

/* JEST: */
.menu-viewer {
    position: fixed;
    top: 15vh; /* Fallback dla starych przeglądarek */
    top: 15dvh; /* Dynamic viewport height (nowoczesne) */
    top: calc(var(--vh, 1vh) * 15); /* JS fallback - MUSI BYĆ OSTATNI */
    left: 0;
    width: 100%;
    height: 85vh; /* Fallback dla starych przeglądarek */
    height: 85dvh; /* Dynamic viewport height (nowoczesne) */
    height: calc(var(--vh, 1vh) * 85); /* JS fallback - MUSI BYĆ OSTATNI */
    ...
}
```

#### G) Komentarz na początku pliku (linia 1-5)
```css
/* DODAJ NA POCZĄTKU: */
/* Mobile Viewport Fix
 * Używamy dvh (dynamic viewport height) zamiast vh
 * dvh automatycznie uwzględnia dynamiczne paski adresu na mobile
 * Fallback na vh dla starszych przeglądarek
 */
```

---

### 2. **js/main_simple.js**

#### Dodaj NA POCZĄTKU pliku (przed wszystkim):
```javascript
// Fix dla viewport height na mobile (fallback dla dvh)
function setRealViewportHeight() {
    // Użyj visualViewport jeśli dostępne (lepsze dla mobile)
    const height = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    const vh = height * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    console.log('🔧 Viewport fix:', {
        visualViewport: window.visualViewport ? window.visualViewport.height : 'not supported',
        innerHeight: window.innerHeight,
        usedHeight: height,
        vh: vh,
        vhPx: `${vh}px`,
        banner15vh: vh * 15,
        viewer85vh: vh * 85
    });
}

// Ustaw przy załadowaniu i przy zmianie orientacji/rozmiaru
setRealViewportHeight();
window.addEventListener('resize', setRealViewportHeight);
window.addEventListener('orientationchange', setRealViewportHeight);
window.addEventListener('scroll', setRealViewportHeight); // Firefox fix

// Dodatkowe nasłuchiwanie dla visualViewport
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setRealViewportHeight);
    window.visualViewport.addEventListener('scroll', setRealViewportHeight);
}

// Wymuszenie update po 500ms (gdy pasek adresu się schowa)
setTimeout(setRealViewportHeight, 500);
```

---

### 3. **index.html** (OPCJONALNIE - tylko do debugowania)

#### Dodaj Eruda console w `<head>` (usuń po debugowaniu):
```html
<!-- Eruda - Mobile Console (usuń po debugowaniu) -->
<script src="https://cdn.jsdelivr.net/npm/eruda"></script>
<script>eruda.init();</script>
```

---

### 4. **save_pages.py**

#### Zmień aby NIE nadpisywać istniejących plików:
```python
# BYŁO (linia ~20-25):
saved_files = []
for page in data['pages']:
    filename = os.path.join(pages_dir, page['filename'])
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(page['content'])
    saved_files.append(page['filename'])

# JEST:
saved_files = []
skipped_files = []
for page in data['pages']:
    filename = os.path.join(pages_dir, page['filename'])
    if os.path.exists(filename):
        skipped_files.append(page['filename'])
        continue
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(page['content'])
    saved_files.append(page['filename'])
```

#### Dodaj info o pominiętych plikach w response (linia ~36-39):
```python
# BYŁO:
response = {
    'success': True,
    'saved': saved_files,
    'count': len(saved_files)
}

# JEST:
response = {
    'success': True,
    'saved': saved_files,
    'count': len(saved_files),
    'skipped': skipped_files,
    'skipped_count': len(skipped_files)
}
```

---

### 5. **hotspot-editor-food.html**

#### Zaktualizuj komunikat o zapisanych plikach (linia ~504-516):
```javascript
// BYŁO:
if (result.success) {
    alert(`✅ Zapisano ${result.count} plików w folderze pages/:\n${result.saved.join('\n')}`);
}

// JEST:
if (result.success) {
    let message = `✅ Zapisano ${result.count} nowych plików w folderze pages/`;
    if (result.saved.length > 0) {
        message += `:\n${result.saved.join('\n')}`;
    }
    if (result.skipped_count > 0) {
        message += `\n\n⚠️ Pominięto ${result.skipped_count} istniejących plików:\n${result.skipped.join('\n')}`;
    }
    alert(message);
}
```

---

## 🤖 SKRYPTY DO URUCHOMIENIA

### 1. **fix_image_flash.py** (już istnieje w projekcie)
Naprawia miganie zaslepki w plikach HTML

```bash
python3 fix_image_flash.py
```

**Co robi:**
- Dodaje `style="opacity: 0;"` do `<img id="dishImage">`
- Dodaje `dishImage.onload` który pokazuje obrazek po załadowaniu
- Dodaje `transition: opacity 0.3s` w CSS
- Modyfikuje **wszystkie pliki HTML** w folderze `pages/`

---

### 2. **fix_mobile_viewport.py** (już istnieje w projekcie)
Naprawia viewport na mobile (ale NIE UŻYWAJ GO - zmiany CSS lepiej zrobić ręcznie)

---

## 📋 INSTRUKCJA DLA DRUGIEGO PROJEKTU

### Krok 1: Skopiuj skrypty
```bash
cp fix_image_flash.py /ścieżka/do/drugiego/projektu/
```

### Krok 2: Zmiany ręczne w CSS
Otwórz `css/style.css` i zastosuj zmiany z sekcji **"ZMIANY RĘCZNE"** punkt 1 (A-G)

### Krok 3: Zmiany w JavaScript
Otwórz `js/main_simple.js` i dodaj kod z sekcji **"ZMIANY RĘCZNE"** punkt 2 NA POCZĄTKU pliku

### Krok 4: Uruchom skrypt dla stron HTML
```bash
cd /ścieżka/do/drugiego/projektu/
python3 fix_image_flash.py
```

### Krok 5: Opcjonalnie - zaktualizuj save_pages.py i hotspot-editor
Jeśli używasz tych plików, zastosuj zmiany z punktów 4 i 5

---

## ✅ WERYFIKACJA

### Sprawdź na telefonie (Firefox Mobile):
1. ❌ Brak białej przerwy pod banerem
2. ❌ Menu nie jest przesunięte w górę
3. ❌ Brak migania zaslepki na stronach dań

### Sprawdź w Eruda Console (opcjonalnie):
```javascript
// Powinno pokazać wysokość ~75px (nie ~90px)
document.querySelector('.ad-banner').offsetHeight

// Powinno pokazać wartość np. "5.04px"
getComputedStyle(document.documentElement).getPropertyValue('--vh')
```

---

## 🔧 TROUBLESHOOTING

### Problem: Nadal biała przerwa
- Sprawdź czy CSS ma `height: calc(var(--vh) * 15)` jako OSTATNIĄ wartość
- Sprawdź czy JavaScript się wykonuje (console.log w Eruda)
- Wyczyść cache przeglądarki (Ctrl+Shift+R)

### Problem: Skrypt nie działa
- Sprawdź czy jesteś w katalogu projektu
- Sprawdź czy folder `pages/` istnieje
- Sprawdź uprawnienia: `chmod +x fix_image_flash.py`

---

**Data utworzenia:** 22.10.2025  
**Autor zmian:** Cascade AI + Konrad  
**Projekt:** Beirut Bar Menu
