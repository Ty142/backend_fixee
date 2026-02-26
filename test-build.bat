@echo off
REM Test build script for backend (Windows)
REM This simulates what Render will do

echo.
echo Testing Backend Build Process...
echo.

REM Step 1: Clean
echo Step 1: Cleaning old build...
if exist dist rmdir /s /q dist
echo Cleaned
echo.

REM Step 2: Install
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo npm install failed
    exit /b 1
)
echo Dependencies installed
echo.

REM Step 3: Build
echo Step 3: Building TypeScript...
call npm run build
if errorlevel 1 (
    echo Build failed
    exit /b 1
)
echo Build completed
echo.

REM Step 4: Verify
echo Step 4: Verifying build output...
if exist dist\server.js (
    echo dist\server.js exists
    dir dist\server.js
) else (
    echo dist\server.js NOT FOUND
    echo Contents of dist:
    if exist dist (
        dir dist
    ) else (
        echo dist folder doesn't exist
    )
    exit /b 1
)
echo.

REM Step 5: Check structure
echo Step 5: Checking dist structure...
echo dist contents:
dir dist
echo.

REM Step 6: Test start
echo Step 6: Testing start command...
echo Command: node dist/server.js
echo (Press Ctrl+C to stop after server starts)
echo.
node dist\server.js
