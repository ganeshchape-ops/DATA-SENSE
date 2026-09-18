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
from backend.app.main import app

def open_browser(url: str):
    time.sleep(1.5)
    try:
        webbrowser.open(url)
    except Exception:
        pass

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
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
