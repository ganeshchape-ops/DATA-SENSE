import sys
import os
from pathlib import Path

# Fix Windows console encoding for UTF-8 support
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add backend directory to sys.path
root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"

if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

import uvicorn
import threading
import webbrowser
import time
import socket

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def find_available_port(start_port: int = 8000, max_attempts: int = 20) -> int:
    for port in range(start_port, start_port + max_attempts):
        if not is_port_in_use(port):
            return port
    return start_port

def open_browser(url: str):
    time.sleep(1.5)
    try:
        webbrowser.open(url)
    except Exception:
        pass

import subprocess

if __name__ == "__main__":
    # Ensure frontend production bundle is present
    frontend_dir = root_dir / "frontend"
    dist_dir = frontend_dir / "dist"
    if not (dist_dir / "index.html").exists():
        print("[INFO] Building frontend production bundle...")
        try:
            subprocess.run(["npm", "run", "build"], cwd=str(frontend_dir), shell=True, check=True)
            print("[INFO] Frontend bundle built successfully.")
        except Exception as e:
            print(f"[WARN] Could not build frontend automatically: {e}")

    preferred_port = int(os.getenv("PORT", 8000))
    port = find_available_port(preferred_port)
    
    url = f"http://127.0.0.1:{port}"
    print(f"\n==================================================================")
    print(f"  AI Insight -- AI-Native Enterprise Predictive Analytics Platform")
    print(f"  Web Dashboard: {url}")
    print(f"  Swagger Docs:  {url}/docs")
    print(f"  ReDoc Docs:    {url}/redoc")
    print(f"==================================================================\n")
    
    # Auto-open browser in background
    threading.Thread(target=open_browser, args=(url,), daemon=True).start()
    
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=port, reload=False)
