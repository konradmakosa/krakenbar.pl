#!/bin/bash

# Konfiguracja FTP
FTP_HOST="beirut.home.pl"
FTP_USER="konrad@beirutbar.pl"
FTP_PASS="5147raRA!@#$"
REMOTE_DIR="/krakenbar"  # ścieżka na serwerze
LOCAL_DIR="/Users/konradmakosa/Documents/galkowski/menu www/krakenbar.pl"

echo "🔽 KROK 1: Pobieranie danych klienta z serwera..."
echo "   Katalog: pages/data/ (JSONy z konfiguracją podstron)"

# Pobierz dane klienta z serwera (pages/data/)
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
lcd $LOCAL_DIR
cd $REMOTE_DIR
mirror --verbose --no-perms pages/data/ pages/data/ || exit 0
bye
" 2>&1 | tee /tmp/deploy_log.txt

# Sprawdź czy katalog istnieje
if grep -q "No such file or directory" /tmp/deploy_log.txt; then
    echo "   ℹ️  Katalog pages/data/ nie istnieje jeszcze na serwerze (to normalne)"
fi
rm -f /tmp/deploy_log.txt

echo ""
echo "🔼 KROK 2: Wysyłanie plików na serwer..."
echo "   Wykluczenia: .git/, .DS_Store, *.py, *.md, pages/data/"

# Upload przez lftp (z wykluczeniem pages/data/)
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
  --exclude pages/data/
bye
"

echo ""
echo "✅ Deploy zakończony pomyślnie!"
echo "   ✓ Dane klienta (pages/data/) pobrane z serwera"
echo "   ✓ Pliki wysłane na FTP (z wykluczeniem danych klienta)"
