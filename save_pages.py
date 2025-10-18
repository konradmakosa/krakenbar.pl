#!/usr/bin/env python3
"""
Prosty serwer do zapisywania plików HTML z edytora hotspotów
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs

class SavePagesHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/save-pages':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            pages_dir = 'pages'
            os.makedirs(pages_dir, exist_ok=True)
            
            saved_files = []
            for page in data['pages']:
                filename = os.path.join(pages_dir, page['filename'])
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(page['content'])
                saved_files.append(page['filename'])
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                'success': True,
                'saved': saved_files,
                'count': len(saved_files)
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    PORT = 8001
    server = HTTPServer(('localhost', PORT), SavePagesHandler)
    print(f'Serwer do zapisywania plików działa na http://localhost:{PORT}')
    print('Endpoint: POST /save-pages')
    server.serve_forever()
