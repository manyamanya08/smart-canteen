#!/usr/bin/env python3
"""
Smart Canteen Management System - Python Web Server & REST API
Zero third-party dependencies: runs on standard library `http.server`!
"""

import http.server
import socketserver
import json
import os
import mimetypes
from urllib.parse import urlparse

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class SmartCanteenHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS for local cross-testing
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # REST API endpoints
        if parsed.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'status': 'online', 'server': 'Python 3 Standard Server'}).encode('utf-8'))
            return
            
        return super().do_GET()

def main():
    with socketserver.TCPServer(("", PORT), SmartCanteenHandler) as httpd:
        print("\n" + "="*58)
        print(f"⚡ Smart Canteen Python Server running at http://localhost:{PORT}")
        print("="*58 + "\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")

if __name__ == '__main__':
    main()
