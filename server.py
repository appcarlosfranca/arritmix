from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser, threading, json, base64, io, re
import socket

def pick_port(start=8765):
    for port in range(start,start+30):
        with socket.socket() as s:
            try:
                s.bind(('127.0.0.1',port)); return port
            except OSError:
                pass
    raise RuntimeError('Nenhuma porta local livre encontrada.')
PORT=pick_port()
os.chdir(Path(__file__).resolve().parent)

def ocr_image(data_url, kind='gas'):
    raw=data_url.split(',',1)[1] if ',' in data_url else data_url
    blob=base64.b64decode(raw)
    try:
        from PIL import Image, ImageOps, ImageEnhance, ImageFilter
        import pytesseract
        # Windows installers commonly use this path; configure automatically if not on PATH.
        if os.name=='nt':
            exe=Path(r'C:\Program Files\Tesseract-OCR\tesseract.exe')
            if exe.exists(): pytesseract.pytesseract.tesseract_cmd=str(exe)
    except Exception as e:
        raise RuntimeError('OCR local requer Pillow + pytesseract + Tesseract OCR instalados.') from e
    img=Image.open(io.BytesIO(blob)).convert('RGB')
    maxw=2200
    if img.width>maxw:
        h=round(img.height*maxw/img.width); img=img.resize((maxw,h))
    g=ImageOps.grayscale(img); g=ImageOps.autocontrast(g, cutoff=1); g=ImageEnhance.Contrast(g).enhance(1.8); g=g.filter(ImageFilter.SHARPEN)
    # PSM 6 works well for printed lab reports; ECG text can be sparse, so use 11.
    psm='11' if kind=='ecg' else '6'
    return pytesseract.image_to_string(g, config=f'--psm {psm}')

class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path!='/api/ocr':
            self.send_error(404); return
        try:
            n=int(self.headers.get('Content-Length','0'))
            if n<=0 or n>20*1024*1024: raise ValueError('Imagem ausente ou grande demais.')
            body=json.loads(self.rfile.read(n).decode('utf-8'))
            text=ocr_image(body.get('image',''), body.get('kind','gas'))
            payload=json.dumps({'ok':True,'text':text},ensure_ascii=False).encode('utf-8')
            self.send_response(200); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(payload))); self.end_headers(); self.wfile.write(payload)
        except Exception as e:
            payload=json.dumps({'ok':False,'error':str(e)},ensure_ascii=False).encode('utf-8')
            self.send_response(503); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Content-Length',str(len(payload))); self.end_headers(); self.wfile.write(payload)

url=f'http://localhost:{PORT}/index_standalone.html'
if os.environ.get('CF_NO_BROWSER')!='1': threading.Timer(0.6, lambda: webbrowser.open(url)).start()
print(f'CF ArritmiX v1.5: {url}')
print('Foto/câmera ativa. OCR local será usado se Pillow, pytesseract e Tesseract OCR estiverem instalados.')
print('Se não estiverem, o navegador tenta OCR nativo ou Tesseract.js online sob demanda.')
print('Mantenha esta janela aberta. Ctrl+C para encerrar.')
ThreadingHTTPServer(('127.0.0.1',PORT), Handler).serve_forever()
