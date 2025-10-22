#!/bin/bash

# Skrypt do backupu danych klienta z serwera FTP
# Pobiera katalog pages/data/ i zapisuje z datą

# Konfiguracja FTP
FTP_HOST="beirut.home.pl"
FTP_USER="konrad@beirutbar.pl"
FTP_PASS="5147raRA!@#$"
REMOTE_DIR="/krakenbar"

# Nazwa katalogu backup z datą
BACKUP_DIR="backup_pages_data_$(date +%Y%m%d_%H%M%S)"

echo "📦 Tworzenie backupu danych klienta..."
echo "   Źródło: $FTP_HOST$REMOTE_DIR/pages/data/"
echo "   Cel: ./$BACKUP_DIR/"
echo ""

# Pobierz dane z serwera
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
cd $REMOTE_DIR
mirror --verbose pages/data/ $BACKUP_DIR/
bye
"

echo ""
if [ -d "$BACKUP_DIR" ]; then
    FILE_COUNT=$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')
    echo "✅ Backup zakończony pomyślnie!"
    echo "   📁 Katalog: $BACKUP_DIR/"
    echo "   📄 Plików: $FILE_COUNT"
else
    echo "❌ Backup nie powiódł się - katalog nie został utworzony"
    exit 1
fi
