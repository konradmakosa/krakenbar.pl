#!/bin/bash

# Konfiguracja FTP
FTP_HOST="beirut.home.pl"
FTP_USER="konrad@beirutbar.pl"
FTP_PASS="5147raRA!@#$"
REMOTE_DIR="/krakenbar"  # ścieżka na serwerze
LOCAL_DIR="/Users/konradmakosa/Documents/galkowski/menu www/krakenbar.pl"

# Upload przez lftp
lftp -c "
set ftp:ssl-allow no
open -u $FTP_USER,$FTP_PASS $FTP_HOST
lcd $LOCAL_DIR
cd $REMOTE_DIR
mirror --reverse --delete --verbose --exclude .git/ --exclude .DS_Store --exclude deploy.sh --exclude .gitignore --exclude README.md
bye
"

echo "✓ Pliki zostały wrzucone na FTP"
