from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser, threading
PORT=8765
os.chdir(Path(__file__).resolve().parent)
url=f'http://localhost:{PORT}/index_standalone.html'
threading.Timer(0.6, lambda: webbrowser.open(url)).start()
print(f'ArritmiaX v1.4: {url}')
print('Mantenha esta janela aberta enquanto usa a câmera. Ctrl+C para encerrar.')
ThreadingHTTPServer(('127.0.0.1',PORT), SimpleHTTPRequestHandler).serve_forever()
