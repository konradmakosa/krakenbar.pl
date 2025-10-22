#!/usr/bin/env python3
"""
Skrypt naprawia miganie zaslepki.jpg w plikach HTML
Ukrywa obrazek na starcie i pokazuje go dopiero po załadowaniu właściwego
"""
import os
import re

pages_dir = 'pages'

# Znajdź wszystkie pliki HTML
html_files = [f for f in os.listdir(pages_dir) if f.endswith('.html')]

print(f"Znaleziono {len(html_files)} plików HTML")

for filename in html_files:
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Sprawdź czy plik już został zmodyfikowany
    if 'opacity: 0;' in content and 'dishImage.style.opacity' in content:
        print(f"⏭️  {filename} - już zmodyfikowany")
        continue
    
    modified = False
    
    # 1. Dodaj style="opacity: 0;" do obrazka
    old_img = '<img id="dishImage" class="dish-image" src="../images/zaslepka.jpg" alt="Danie">'
    new_img = '<img id="dishImage" class="dish-image" src="../images/zaslepka.jpg" alt="Danie" style="opacity: 0;">'
    
    if old_img in content:
        content = content.replace(old_img, new_img)
        modified = True
    
    # 2. Dodaj kod pokazujący obrazek po załadowaniu
    # Znajdź linię: dishImage.src = data.image;
    old_code = '            dishImage.src = data.image;'
    new_code = '''            dishImage.src = data.image;
            
            // Pokaż obrazek po załadowaniu
            dishImage.onload = function() {
                dishImage.style.opacity = '1';
            };'''
    
    if old_code in content and 'dishImage.onload' not in content:
        content = content.replace(old_code, new_code)
        modified = True
    
    # 3. Dodaj transition do CSS dla płynnego pojawienia się
    old_css = '''        .dish-image {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }'''
    
    new_css = '''        .dish-image {
            width: 100%;
            height: auto;
            display: block;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            transition: opacity 0.3s ease-in-out;
        }'''
    
    if old_css in content and 'transition: opacity' not in content:
        content = content.replace(old_css, new_css)
        modified = True
    
    if modified:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ {filename} - zmodyfikowany")
    else:
        print(f"⚠️  {filename} - brak zmian (może mieć inną strukturę)")

print("\n✅ Gotowe!")
