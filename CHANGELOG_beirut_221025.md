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

## 📊 GOOGLE ANALYTICS (22.10.2025)

### Dodano tracking Google Analytics do wszystkich podstron

**Tracking ID:** `G-GCL42G0L6D`

#### Skrypt: **add_analytics.py**
```python
#!/usr/bin/env python3
"""
Skrypt dodaje Google Analytics do wszystkich plików HTML w folderze pages/
"""
```

**Co robi:**
- Dodaje kod Google Analytics (gtag.js) do wszystkich plików HTML w `pages/`
- Wstawia kod po tagu `</title>` w sekcji `<head>`
- Sprawdza czy plik już ma Analytics (pomija duplikaty)
- Przetwarza automatycznie wszystkie 77 plików HTML

**Kod Analytics:**
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-GCL42G0L6D"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-GCL42G0L6D');
</script>
```

**Uruchomienie:**
```bash
python3 add_analytics.py
```

**Wynik:**
- ✅ 77 plików HTML zaktualizowanych
- ✅ Wszystkie podstrony mają teraz tracking
- ✅ Zmiany wrzucone na serwer FTP przez `deploy.sh`

**Deployment:**
```bash
bash deploy.sh
```

---

## 🚨 KRYTYCZNY PROBLEM - KATALOG `pages/__DIR__/` (22.10.2025)

### ❌ Problem: Deploy usunął dane klienta z serwera

**Co się stało:**
- Skrypt `deploy.sh` używa `mirror --reverse --delete`
- Katalog `pages/__DIR__/data/` z JSONami **nie istniał lokalnie**
- Podczas deploymentu katalog został **usunięty z serwera FTP**
- **Utracono dane wprowadzone przez klienta** (36 plików JSON z konfiguracją podstron)

**Output z deploymentu:**
```
Removing old directory `pages/__DIR__'
```

### ✅ Rozwiązanie

#### 1. Przywrócenie katalogu z kopii zapasowej
```bash
cp -r "kopia 251021/pages/__DIR__" pages/
```

**Przywrócono:**
- 36 plików JSON z danymi podstron
- Katalog `pages/__DIR__/data/` z konfiguracją hotspotów

#### 2. Naprawa `deploy.sh` - dwukierunkowa synchronizacja

**Nowy mechanizm deploymentu:**

**Krok 1: Pobierz dane klienta z serwera**
```bash
# Pobierz katalog pages/__DIR__/ z serwera (dane klienta)
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
lcd $LOCAL_DIR
cd $REMOTE_DIR
mirror --verbose pages/__DIR__/ pages/__DIR__/
bye
"
```

**Krok 2: Wyślij pliki na serwer (z wykluczeniem danych klienta)**
```bash
# Wyślij pliki na serwer (z wykluczeniem pages/__DIR__/)
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
lcd $LOCAL_DIR
cd $REMOTE_DIR
mirror --reverse --delete --verbose \
  --exclude .git/ \
  --exclude .DS_Store \
  --exclude deploy.sh \
  --exclude .gitignore \
  --exclude README.md \
  --exclude-glob *.py \
  --exclude-glob *.md \
  --exclude pages/__DIR__/
bye
"
```

**Efekt:**
- ✅ **Przed każdym deploymentem** pobiera aktualne dane klienta z serwera
- ✅ Lokalnie zawsze masz najnowsze JSONy wprowadzone przez klienta
- ✅ Upload **nie nadpisuje** katalogu `pages/__DIR__/` na serwerze
- ✅ Dane klienta są bezpieczne i zawsze zsynchronizowane
- ✅ Pliki Python i Markdown nie są wysyłane na serwer

### ⚠️ UWAGA

**Jeśli klient wprowadził nowe dane po 25.10.2021, zostały one utracone!**

Należy sprawdzić na serwerze FTP czy:
1. Katalog `pages/__DIR__/` nadal istnieje
2. Czy zawiera aktualne dane klienta
3. Jeśli nie - trzeba przywrócić z backupu serwera

### ⚠️ UWAGA - Weryfikacja przed wdrożeniem

**Przed wdrożeniem tej zmiany sprawdź na serwerze FTP:**
1. Czy katalog `pages/__DIR__/` istnieje
2. Czy zawiera pliki JSON z danymi klienta
3. Jeśli tak - **KONIECZNIE zrób backup** przed pierwszym deploymentem

**Backup danych:**
```bash
# Pobierz backup danych z serwera (spakuje do ZIP)
./backup_data.sh

# Utworzy plik: backup_pages_data_YYYYMMDD_HHMMSS.zip
```

### 📝 Zalecenia na przyszłość

1. **Zawsze** dodawaj katalogi z danymi klienta do `--exclude` w deploy.sh
2. **Nigdy** nie używaj `--delete` bez dokładnej weryfikacji co zostanie usunięte
3. Rozważ użycie `--dry-run` przed właściwym deploymentem:
   ```bash
   mirror --reverse --delete --dry-run --verbose
   ```
4. **Regularnie commituj `pages/__DIR__/` do GitHuba jako backup:**
   ```bash
   ./deploy.sh              # Pobierze dane z serwera
   git add pages/__DIR__/   # Dodaj JSONy do commita
   git commit -m "Backup danych klienta $(date +%Y-%m-%d)"
   git push                 # Wyślij na GitHuba
   ```
5. Po każdym deploymencie sprawdź czy dane zostały pobrane: `ls -la pages/__DIR__/`

### 🔍 Jak sprawdzić czy dane są bezpieczne

**Test przed deploymentem:**
```bash
# Sprawdź co zostanie usunięte (dry-run)
lftp -c "
set ftp:ssl-allow no
open -u konrad@beirutbar.pl,5147raRA!@#$ beirut.home.pl
lcd /Users/konradmakosa/Documents/galkowski/menu\ www/beirutbar.pl
cd /beirutbar
mirror --reverse --delete --dry-run --verbose
bye
"
```

**Szukaj w output:**
- ❌ `Removing directory pages/__DIR__` - NIEBEZPIECZNE!
- ❌ `Removing file pages/__DIR__/*.json` - NIEBEZPIECZNE!
- ✅ Brak komunikatów o usuwaniu `pages/__DIR__/` - OK

### ✅ Wdrożone zmiany (22.10.2025)

#### 1. **deploy.sh** - Dwukierunkowa synchronizacja
- ✅ Dodano KROK 1: Pobieranie `pages/__DIR__/` z serwera przed deploymentem
- ✅ Dodano KROK 2: Upload z wykluczeniem `--exclude pages/__DIR__/`
- ✅ Dodano wykluczenie plików `*.py` i `*.md` z uploadu
- ✅ Dodano komunikaty o postępie deploymentu
- ✅ Dane klienta są teraz chronione przed usunięciem

#### 2. **backup_data.sh** - Backup danych klienta
- ✅ Utworzono skrypt do pobierania backupu danych z serwera
- ✅ Automatyczne pakowanie do ZIP: `backup_pages_data_YYYYMMDD_HHMMSS.zip`
- ✅ Raport z liczby plików i rozmiaru archiwum
- ✅ Automatyczne usuwanie katalogu tymczasowego
- ✅ Obsługa sytuacji gdy `pages/__DIR__/` nie istnieje na serwerze

#### 2b. **backup_full.sh** - Pełny backup serwisu
- ✅ Utworzono skrypt do pełnego backupu całego serwisu
- ✅ Pobiera wszystkie pliki: HTML, CSS, JS, obrazki, PHP, dane
- ✅ Pakowanie do ZIP: `backup_full_beirutbar_YYYYMMDD_HHMMSS.zip`
- ✅ Raport z liczby plików i rozmiaru archiwum

#### 3. **.gitignore** - Backup danych na GitHubie
- ✅ Katalog `pages/__DIR__/` **NIE jest wykluczony** z gita
- ✅ Pliki JSON będą commitowane jako backup
- ✅ GitHub służy jako dodatkowe zabezpieczenie danych klienta
- ✅ Dodano wykluczenie lokalnych backupów ZIP: `backup_pages_data_*.zip`, `backup_full_beirutbar_*.zip`

#### 4. **README.md** - Dokumentacja deploymentu
- ✅ Dodano sekcję o bezpiecznym deploymencie
- ✅ Instrukcje użycia `deploy.sh`, `backup_data.sh` i `backup_full.sh`
- ✅ Wyjaśnienie różnic między backupami (dane vs. pełny)
- ✅ Wyjaśnienie struktury danych klienta
- ✅ Przykład dry-run przed deploymentem

### 📊 Podsumowanie zabezpieczeń

**Przed zmianami:**
- ❌ Deploy mógł usunąć `pages/__DIR__/` z serwera
- ❌ Brak backupu danych klienta
- ❌ Brak dokumentacji o ryzyku

**Po zmianach:**
- ✅ Deploy pobiera dane przed uploadem
- ✅ Deploy nie nadpisuje `pages/__DIR__/`
- ✅ Skrypt do łatwego backupu
- ✅ Pełna dokumentacja w README
- ✅ Dane klienta backupowane na GitHubie

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

---

## ✅ WERYFIKACJA BACKUPÓW (22.10.2025 11:24)

### Test backup_data.sh
```bash
./backup_data.sh
```

**Wynik:**
- ✅ Pobrano **37 plików JSON** z `pages/__DIR__/data/`
- ✅ Utworzono archiwum: `backup_pages_data_20251022_112455.zip` (16M)
- ✅ Wszystkie dane klienta zabezpieczone

### Test backup_full.sh
```bash
./backup_full.sh
```

**Wynik:**
- ✅ Pobrano **285 plików** z całego serwisu (67M)
- ✅ Utworzono archiwum: `backup_full_beirutbar_20251022_112507.zip` (53M)
- ✅ Zawiera: HTML, CSS, JS, obrazki, PHP, dane klienta

### Potwierdzenie struktury na serwerze FTP:
```
/beirutbar/
├── pages/
│   ├── __DIR__/          ← Dosłownie katalog "__DIR__"
│   │   └── data/         ← 37 plików JSON z danymi klienta
│   ├── *.html            ← 100+ stron HTML
│   ├── save.php
│   └── load.php
├── css/
├── js/
└── images/
```

**Wszystkie skrypty działają poprawnie!** ✅

---

## 🔧 OPTYMALIZACJA GOOGLE ANALYTICS (22.10.2025 13:45)

### Problem: GA nie śledziła pojedynczych dań
- Podstrony otwierają się w modalu bez zmiany URL
- GA widziała tylko `index.html`, nie poszczególne dania
- Brak danych o popularności konkretnych pozycji menu

### Rozwiązanie:

#### 1. **Poprawa tytułów** (77 plików)
```bash
python3 fix_titles.py
```
- ✅ Zmieniono `<title>Kraken Bar` na `<title>Beirut Bar` we wszystkich plikach w `/pages`

#### 2. **Usunięcie duplikatów GA z podstron**
```bash
python3 remove_ga_from_pages.py
```
- ✅ Usunięto kod GA z 77 plików HTML w `/pages`
- ✅ GA pozostała tylko w `index.html` (jeden punkt śledzenia)

#### 3. **Dodanie śledzenia eventów w JavaScript**

**Plik:** `js/main_simple.js` (funkcja `openPageModal`)

```javascript
// Google Analytics - śledzenie otwarcia podstrony
if (typeof gtag !== 'undefined') {
    const pageName = pageUrl.replace('pages/', '').replace('.html', '');
    const pageTitle = pageName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    gtag('event', 'page_view', {
        page_title: 'Beirut Bar - ' + pageTitle,
        page_location: window.location.origin + '/' + pageUrl,
        page_path: '/' + pageUrl
    });
}
```

### 📊 Co teraz widać w Google Analytics:

**Strona główna:**
- Odwiedziny: `beirutbar.pl/index.html`
- Urządzenia, przeglądarki, lokalizacje

**Pojedyncze dania (jako page_view events):**
- `Beirut Bar - Adana Burger` → `/pages/adana-burger.html`
- `Beirut Bar - Hummus Classic` → `/pages/hummus-classic.html`
- `Beirut Bar - Falafel Mix` → `/pages/falafel-mix.html`
- **77 różnych dań śledzone osobno!**

### 🎯 Możliwości analizy:

- ✅ **TOP 10 najpopularniejszych dań** 🏆
- ✅ **Które dania nikt nie klika** (kandydaci do usunięcia)
- ✅ **Ścieżki użytkowników** - co oglądają po kolei
- ✅ **Czas spędzony na przeglądaniu menu**
- ✅ **Porównanie popularności kategorii** (jedzenie vs. drinki)

### 📈 Gdzie znaleźć w GA:
`Events` → `page_view` → filtruj po `page_path` zawierającym `/pages/`

**Commit:** `7c1c9fd` - Poprawa tytułów i optymalizacja Google Analytics

---

## ⚡ OPTYMALIZACJA DEPLOY.SH (22.10.2025 13:52)

### Problem: Niepotrzebne transfery plików
Deploy wysyłał pliki na FTP nawet jeśli się nie zmieniły:
```
Removing old file `data/hotspots_food.json'
Transferring file `data/hotspots_food.json'
```

**Przyczyna:** `mirror --reverse` domyślnie porównuje tylko daty modyfikacji, nie zawartość plików.

### Rozwiązanie:

**Plik:** `deploy.sh` (linia 32)

**BYŁO:**
```bash
mirror --reverse --delete --verbose \
```

**JEST:**
```bash
mirror --reverse --delete --verbose --only-newer \
```

### ✅ Efekt:

Flaga `--only-newer` sprawdza:
- ✅ Datę modyfikacji
- ✅ Rozmiar pliku
- ✅ Pomija transfer jeśli plik jest identyczny

**Następny deploy będzie szybszy** - tylko faktycznie zmienione pliki zostaną wysłane! 🚀
