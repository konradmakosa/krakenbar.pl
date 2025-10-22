#!/usr/bin/env python3
"""
Skrypt usuwa Google Analytics z plików HTML w folderze pages/
"""

import os
import glob
import re

def remove_ga():
    pages_dir = 'pages'
    
    if not os.path.exists(pages_dir):
        print(f"❌ Katalog {pages_dir}/ nie istnieje")
        return
    
    html_files = glob.glob(os.path.join(pages_dir, '*.html'))
    
    if not html_files:
        print(f"❌ Brak plików HTML w {pages_dir}/")
        return
    
    modified_count = 0
    
    # Pattern do znalezienia całego bloku GA (od komentarza do końca skryptu)
    ga_pattern = re.compile(
        r'<!-- Google tag \(gtag\.js\) -->.*?</script>\s*',
        re.DOTALL
    )
    
    for filepath in html_files:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Sprawdź czy plik ma GA
            if 'gtag.js' in content:
                # Usuń cały blok GA
                new_content = ga_pattern.sub('', content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                modified_count += 1
                filename = os.path.basename(filepath)
                print(f"✅ {filename}")
        
        except Exception as e:
            print(f"❌ Błąd w {filepath}: {e}")
    
    print(f"\n✅ Usunięto GA z {modified_count} plików")

if __name__ == '__main__':
    print("🗑️  Usuwanie Google Analytics z plików w pages/...\n")
    remove_ga()
