import os
import subprocess
import sys

def build_exe():
    print("==========================================")
    print("   Building Winter Arc Tracker Executable  ")
    print("==========================================")

    # 1. Build frontend React static bundle first
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
    print("\nStep 1: Building Frontend static assets...")
    subprocess.run(["npm.cmd", "run", "build"], cwd=frontend_dir, check=True)

    # 2. Check pyinstaller installation
    print("\nStep 2: Checking PyInstaller...")
    try:
        import PyInstaller
    except ImportError:
        print("PyInstaller not found. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)

    # 3. Build executable via PyInstaller
    desktop_app = os.path.join(os.path.dirname(__file__), "desktop_main.py")
    dist_dir = os.path.join(os.path.dirname(__file__), "dist")
    
    cmd = [
        "pyinstaller",
        "--noconfirm",
        "--onedir",
        "--windowed",
        "--name=WinterArcTracker",
        f"--add-data={os.path.join(frontend_dir, 'dist')};frontend/dist",
        f"--add-data={os.path.join(os.path.dirname(__file__), '..', 'backend')};backend",
        desktop_app
    ]

    print(f"\nStep 3: Running PyInstaller command:\n{' '.join(cmd)}")
    subprocess.run(cmd, check=True)
    print(f"\n[SUCCESS] Executable created in: {dist_dir}\\WinterArcTracker\\WinterArcTracker.exe")

if __name__ == "__main__":
    build_exe()
