#!/bin/bash

# Skrypt do backupu danych klienta z serwera FTP
# Pobiera katalog pages/data/ i pakuje do ZIP z timestampem

# Konfiguracja FTP
FTP_HOST="beirut.home.pl"
FTP_USER="konrad@beirutbar.pl"
FTP_PASS="5147raRA!@#$"
REMOTE_DIR="/krakenbar"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_temp_$TIMESTAMP"
ZIP_FILE="backup_pages_data_$TIMESTAMP.zip"

echo "📦 Tworzenie backupu danych klienta..."
echo "   Źródło: $FTP_HOST$REMOTE_DIR/pages/data/"
echo "   Cel: ./$ZIP_FILE"
echo ""

# Pobierz dane z serwera
echo "🔽 Pobieranie plików z serwera..."
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $REMOTE_DIR
mirror --verbose --no-perms pages/data/ $BACKUP_DIR/ || exit 0
bye
" 2>&1 | tee /tmp/backup_log.txt

# Sprawdź czy katalog istnieje na serwerze
if grep -q "No such file or directory" /tmp/backup_log.txt; then
    echo ""
    echo "ℹ️  Katalog pages/data/ nie istnieje na serwerze"
    echo "   To normalne - katalog jest tworzony gdy klient zapisze pierwsze dane"
    echo ""
    echo "💡 Katalog zostanie utworzony automatycznie gdy:"
    echo "   1. Klient otworzy stronę (np. appleton-right-hand.html)"
    echo "   2. Kliknie 5x w lewy górny róg"
    echo "   3. Wprowadzi hasło i zapisze dane"
    rm -f /tmp/backup_log.txt
    exit 0
fi

echo ""
if [ -d "$BACKUP_DIR" ]; then
    FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
    
    if [ "$FILE_COUNT" -eq 0 ]; then
        echo "ℹ️  Katalog pages/data/ jest pusty - brak danych do backupu"
        rm -rf "$BACKUP_DIR"
        rm -f /tmp/backup_log.txt
        exit 0
    fi
    
    echo "✅ Pobrano $FILE_COUNT plików"
    
    # Pakuj do ZIP
    echo ""
    echo "📦 Pakowanie do ZIP..."
    zip -r "$ZIP_FILE" "$BACKUP_DIR" > /dev/null 2>&1
    
    if [ -f "$ZIP_FILE" ]; then
        ZIP_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
        echo "✅ Spakowano do: $ZIP_FILE ($ZIP_SIZE)"
        
        # Usuń katalog tymczasowy
        rm -rf "$BACKUP_DIR"
        echo "🗑️  Usunięto katalog tymczasowy"
        
        echo ""
        echo "✅ Backup zakończony pomyślnie!"
        echo "   📦 Plik: $ZIP_FILE"
        echo "   📄 Plików: $FILE_COUNT"
        echo "   💾 Rozmiar: $ZIP_SIZE"
        
        # Wyczyść plik tymczasowy
        rm -f /tmp/backup_log.txt
    else
        echo "❌ Błąd podczas pakowania do ZIP"
        rm -rf "$BACKUP_DIR"
        rm -f /tmp/backup_log.txt
        exit 1
    fi
else
    echo "❌ Backup nie powiódł się - katalog nie został utworzony"
    rm -f /tmp/backup_log.txt
    exit 1
fi
