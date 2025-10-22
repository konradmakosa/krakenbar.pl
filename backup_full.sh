#!/bin/bash

# Skrypt do pełnego backupu całego serwisu z FTP
# Pobiera wszystkie pliki i pakuje do ZIP z timestampem

# Konfiguracja FTP
FTP_HOST="beirut.home.pl"
FTP_USER="konrad@beirutbar.pl"
FTP_PASS="5147raRA!@#$"
REMOTE_DIR="/krakenbar"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_full_temp_$TIMESTAMP"
ZIP_FILE="backup_full_krakenbar_$TIMESTAMP.zip"

echo "📦 Tworzenie pełnego backupu serwisu..."
echo "   Źródło: $FTP_HOST$REMOTE_DIR/"
echo "   Cel: ./$ZIP_FILE"
echo ""

# Pobierz wszystkie pliki z serwera
echo "🔽 Pobieranie wszystkich plików z serwera..."
echo "   (to może chwilę potrwać...)"
echo ""
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
lcd $LOCAL_DIR
cd $REMOTE_DIR
mirror --verbose --no-perms ./ $BACKUP_DIR/
bye
" 2>&1 | grep -E "^(get|mkdir|Total|Transferring)" || true

echo ""
if [ -d "$BACKUP_DIR" ]; then
    FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
    DIR_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo "✅ Pobrano $FILE_COUNT plików ($DIR_SIZE)"
    
    # Pakuj do ZIP
    echo ""
    echo "📦 Pakowanie do ZIP..."
    zip -r -q "$ZIP_FILE" "$BACKUP_DIR"
    
    if [ -f "$ZIP_FILE" ]; then
        ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
        echo "✅ Spakowano do: $ZIP_FILE ($ZIP_SIZE)"
        
        # Usuń katalog tymczasowy
        rm -rf "$BACKUP_DIR"
        echo "🗑️  Usunięto katalog tymczasowy"
        
        echo ""
        echo "✅ Pełny backup zakończony pomyślnie!"
        echo "   📦 Plik: $ZIP_FILE"
        echo "   📄 Plików: $FILE_COUNT"
        echo "   💾 Rozmiar: $ZIP_SIZE"
        echo ""
        echo "💡 Zawartość backupu:"
        echo "   • Wszystkie pliki HTML"
        echo "   • Obrazki (images/)"
        echo "   • Style CSS (css/)"
        echo "   • Skrypty JS (js/)"
        echo "   • Dane klienta (pages/data/)"
        echo "   • Pliki PHP (pages/*.php)"
    else
        echo "❌ Błąd podczas pakowania do ZIP"
        rm -rf "$BACKUP_DIR"
        exit 1
    fi
else
    echo "❌ Backup nie powiódł się - katalog nie został utworzony"
    exit 1
fi
