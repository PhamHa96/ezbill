#!/bin/bash
set -e

# ============================================================
# 🤖 Android Live Reload Build Script
# Author: Ha Pham
# Purpose: Run Vite + Capacitor Android live reload on device or emulator
# ============================================================

# Check for required tools
if ! command -v adb &> /dev/null; then
  echo "❌ adb not found. Please install Android Platform Tools first."
  exit 1
fi

if ! command -v fzf &> /dev/null; then
  echo "⚠️  fzf not found — installing via Homebrew..."
  brew install fzf || {
    echo "❌ Failed to install fzf. Please install manually: brew install fzf"
    exit 1
  }
fi

echo "📱 Scanning Android devices and emulators..."

# --- Get connected devices ---
DEVICES=$(adb devices -l | grep -v "List of devices" | grep -v "^$" || true)
EMULATORS=$(emulator -list-avds 2>/dev/null || true)

MENU_ITEMS=""

if [ -n "$DEVICES" ]; then
  MENU_ITEMS+="\n=== Connected Devices ===\n$DEVICES"
else
  MENU_ITEMS+="\n(No physical devices connected)"
fi

if [ -n "$EMULATORS" ]; then
  MENU_ITEMS+="\n\n=== Available Emulators ===\n$(echo "$EMULATORS" | sed 's/^/emulator: /')"
else
  MENU_ITEMS+="\n\n(No emulators found)"
fi

# --- Choose device/emulator ---
SELECTED_DEVICE=$(echo -e "$MENU_ITEMS" | fzf --ansi --prompt="Select Android Target ▶ " --height=20 --border --reverse)

if [ -z "$SELECTED_DEVICE" ]; then
  echo "❌ No device selected. Exiting."
  exit 1
fi

# --- Determine target ID ---
if echo "$SELECTED_DEVICE" | grep -q "^emulator:"; then
  EMULATOR_NAME=$(echo "$SELECTED_DEVICE" | sed 's/emulator: //')
  echo "🚀 Launching emulator: $EMULATOR_NAME ..."
  nohup emulator -avd "$EMULATOR_NAME" -netdelay none -netspeed full >/dev/null 2>&1 &
  sleep 10
  TARGET_ID=$(adb devices | grep "emulator-" | head -n1 | awk '{print $1}')
else
  TARGET_ID=$(echo "$SELECTED_DEVICE" | awk '{print $1}')
fi

if [ -z "$TARGET_ID" ]; then
  echo "❌ Could not detect valid Android target."
  exit 1
fi

echo ""
echo "✅ Selected device: $TARGET_ID"
echo ""

# --- Start Vite dev server ---
echo "🚀 Starting Vite development server..."
npm run dev > vite_output.log 2>&1 &
VITE_PID=$!

cleanup() {
  echo "🧹 Cleaning up... Stopping Vite server (PID: $VITE_PID)"
  kill $VITE_PID 2>/dev/null || true
}
trap cleanup SIGINT SIGTERM EXIT

sleep 3

echo ""
echo "🔗 Syncing Capacitor Android project..."
npx cap sync android

echo ""
echo "🏗️ Running Android app with Live Reload on: $TARGET_ID"

# --- Run with Live Reload ---
npx cap run android --target "$TARGET_ID" --live-reload
