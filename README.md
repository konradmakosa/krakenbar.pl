# Kraken Bar - Interaktywne Menu

Interaktywne menu dla Kraken Bar z możliwością przesuwania, zoomowania i przeglądania na urządzeniach mobilnych i desktopowych.

## Funkcje

- 📱 **Responsywne** - działa na komputerach, tabletach i telefonach
- 🔍 **Zoom** - powiększanie i pomniejszanie obrazu menu
- 👆 **Przesuwanie** - płynne przesuwanie obrazu myszą lub dotykiem
- 🎯 **Momentum scrolling** - inercja po puszczeniu (jak w aplikacjach mobilnych)
- ⚙️ **Konfigurowalne** - łatwa konfiguracja widoku początkowego i animacji
- 🚫 **Bez tła** - obraz zawsze wypełnia cały ekran

## Technologie

- HTML5
- CSS3
- Vanilla JavaScript (bez zewnętrznych bibliotek)

## Struktura projektu

```
windsurf-project/
├── index.html          # Główny plik HTML
├── css/
│   ├── style.css       # Style główne
│   └── animations.css  # Animacje i efekty
├── js/
│   ├── config.js       # Konfiguracja aplikacji
│   ├── main_new.js     # Główna logika aplikacji
│   └── preloader.js    # Preloader
└── images/
    └── menu_zoli.png   # Obraz menu
```

## Konfiguracja

Wszystkie ustawienia znajdują się w pliku `js/config.js`:

### Widok początkowy

```javascript
initialView: {
    scalePercent: 60,  // Widoczne 60% obrazu (powiększone)
    focusX: 0,         // Lewy brzeg (0-100)
    focusY: 0,         // Górny brzeg (0-100)
    position: null,    // Lub użyj: 'top-left', 'center', itp.
}
```

### Zoomowanie

```javascript
zoom: {
    minScale: 1,              // Minimalne powiększenie
    maxScale: 4,              // Maksymalne powiększenie
    step: 1.3,                // Krok zoomowania (+/-)
    wheelSensitivity: 0.1,    // Czułość kółka myszy
}
```

### Animacje

```javascript
animation: {
    smoothTransition: true,     // Płynne przejścia
    transitionDuration: 0.2,    // Czas przejścia (s)
    momentum: true,             // Inercja
    momentumFriction: 0.95,     // Tarcie (0.9-0.99)
}
```

## Instalacja

1. Sklonuj repozytorium:
```bash
git clone https://github.com/konradmakosa/kraken.git
```

2. Otwórz `index.html` w przeglądarce lub wrzuć na serwer

## Użycie

### Desktop
- **Przeciąganie**: Kliknij i przeciągnij myszą
- **Zoom**: Użyj kółka myszy lub przycisków +/-
- **Reset**: Kliknij przycisk ↺

### Mobile
- **Przeciąganie**: Przeciągnij palcem
- **Zoom**: Pinch-to-zoom (dwa palce)
- **Reset**: Kliknij przycisk ↺

## Deployment

### FTP - Bezpieczny deploy z ochroną danych klienta

**⚠️ WAŻNE:** Skrypt `deploy.sh` używa dwukierunkowej synchronizacji, aby chronić dane wprowadzone przez klienta!

#### Jak działa deploy:

1. **Pobiera dane klienta z serwera** (`pages/data/`)
   - JSONy z konfiguracją podstron
   - Tworzone dynamicznie przez `save.php` na serwerze

2. **Wysyła pliki na serwer** (z wykluczeniem `pages/data/`)
   - Pliki HTML, CSS, JS
   - **NIE nadpisuje** danych klienta

#### Użycie:

```bash
# Deploy na serwer FTP
./deploy.sh
```

#### Backup danych klienta:

```bash
# Pobierz backup danych z serwera (spakuje do ZIP)
./backup_data.sh
```

**Utworzy plik ZIP:** `backup_pages_data_YYYYMMDD_HHMMSS.zip`

#### Struktura danych klienta:

```
pages/
├── data/              ← DANE KLIENTA (serwer + backup w git)
│   ├── {page1}.json   ← Konfiguracja podstrony 1
│   ├── {page2}.json   ← Konfiguracja podstrony 2
│   └── ...
├── save.php           ← Skrypt do zapisu danych
├── load.php           ← Skrypt do odczytu danych
└── *.html             ← Strony HTML
```

**⚠️ WAŻNE:** Pliki JSON z `pages/data/` są commitowane do GitHuba jako backup!

#### Workflow: Deploy + Backup na GitHubie

```bash
# 1. Deploy (pobierze dane z serwera i wyśle zmiany)
./deploy.sh

# 2. Backup danych na GitHubie
git add pages/data/
git commit -m "Backup danych klienta $(date +%Y-%m-%d)"
git push

# 3. Gotowe! Dane są bezpieczne na serwerze i w repozytorium
```

#### Test przed deploymentem (dry-run):

```bash
# Sprawdź co zostanie zmienione (bez wykonywania)
lftp -c "
set ftp:ssl-allow no
open -u konrad@beirutbar.pl,5147raRA!@#$ beirut.home.pl
lcd /Users/konradmakosa/Documents/galkowski/menu\ www/krakenbar.pl
cd /krakenbar
mirror --reverse --delete --dry-run --verbose
bye
"
```

### GitHub Pages
1. Wejdź w Settings → Pages
2. Wybierz branch `main` i folder `/` (root)
3. Strona będzie dostępna pod adresem: `https://konradmakosa.github.io/kraken/`

## Licencja

© 2024 Kraken Bar. Wszelkie prawa zastrzeżone.

## Autor

Konrad Makosa
