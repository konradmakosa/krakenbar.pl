#!/usr/bin/env python3
"""
Skrypt dodaje Google Analytics do wszystkich plików HTML w folderze pages/
"""
import os
import re

pages_dir = 'pages'

# Google Analytics kod do wstawienia
ga_code = '''
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CDW1EMWRQV"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-CDW1EMWRQV');
</script>
    '''

# Znajdź wszystkie pliki HTML
html_files = [f for f in os.listdir(pages_dir) if f.endswith('.html')]

print(f"Znaleziono {len(html_files)} plików HTML")

for filename in html_files:
    filepath = os.path.join(pages_dir, filename)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Sprawdź czy już ma Google Analytics
    if 'gtag.js' in content or 'G-CDW1EMWRQV' in content:
        print(f"⏭️  {filename} - już ma Google Analytics")
        continue
    
    # Znajdź miejsce po <title> i przed <style> lub </head>
    # Szukamy wzorca: </title>\n    <style> lub </title>\n</head>
    pattern = r'(</title>\n)(    <style>|</head>)'
    
    if re.search(pattern, content):
        # Wstaw GA kod po </title>
        new_content = re.sub(pattern, r'\1' + ga_code + r'\2', content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"✅ {filename} - dodano Google Analytics")
    else:
        print(f"⚠️  {filename} - nie znaleziono odpowiedniego miejsca")

print("\n✅ Gotowe!")
