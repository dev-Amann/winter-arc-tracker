import os
import sys
import time
import threading
import urllib.request
import webview
import uvicorn

# Add backend directory to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app as fastapi_app
from app.config import settings

def run_backend():
    """Start FastAPI Uvicorn server on localhost."""
    uvicorn.run(
        fastapi_app,
        host=settings.API_HOST,
        port=settings.API_PORT,
        log_level="warning"
    )

def is_server_running(url):
    """Check if server is already running on the given URL."""
    try:
        with urllib.request.urlopen(f"{url}/api/health", timeout=1) as response:
            return response.status == 200
    except Exception:
        return False

def wait_for_server(url, timeout=10):
    """Wait for FastAPI server health check endpoint to respond."""
    start_time = time.time()
    while time.time() - start_time < timeout:
        if is_server_running(url):
            return True
        time.sleep(0.3)
    return False

def main():
    print("Starting Winter Arc Tracker Desktop App...")
    server_url = f"http://{settings.API_HOST}:{settings.API_PORT}"

    # Check if backend server is already running (e.g. running as daemon or separate terminal)
    if is_server_running(server_url):
        print(f"Backend service is already online at {server_url}. Connecting to active instance...")
    else:
        print(f"Launching backend service on {server_url}...")
        server_thread = threading.Thread(target=run_backend, daemon=True)
        server_thread.start()

        if wait_for_server(server_url):
            print("Backend service initialized successfully!")
        else:
            print("Warning: Backend health check timed out. Attempting window creation...")

    # Launch PyWebView Native Desktop Window
    webview.create_window(
        title="Winter Arc Tracker",
        url=server_url,
        width=1280,
        height=850,
        min_size=(1024, 700),
        resizable=True,
        confirm_close=True
    )
    
    webview.start(debug=False)

if __name__ == "__main__":
    main()
