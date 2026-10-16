#!/usr/bin/env bash
set -e

echo "=================================================="
echo "    Arc Tracker — iOS Build & Setup Tool          "
echo "=================================================="

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "⚠️  Note: iOS builds require Apple Xcode and macOS toolchains."
  echo "👉 For Windows/Linux users: Use our GitHub Actions automated release workflow"
  echo "   (.github/workflows/build-and-release.yml) which builds iOS on a macOS cloud runner!"
  exit 1
fi

# Check for Xcode command line tools
if ! command -v xcodebuild &> /dev/null; then
  echo "❌ Xcode is not installed or xcode-select is not pointing to Xcode."
  echo "Please install Xcode from the Mac App Store and run: sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
  exit 1
fi

echo "✅ Xcode detected: $(xcodebuild -version | head -n 1)"

# Add Rust iOS targets if rustup is installed
if command -v rustup &> /dev/null; then
  echo "📦 Ensuring Rust iOS toolchain targets are installed..."
  rustup target add aarch64-apple-ios aarch64-apple-ios-sim x86_64-apple-ios
fi

# Build offline web assets
echo "🔨 Building web bundle..."
npm ci
node scripts/localize-assets.js
node scripts/convert-html.js
node scripts/generate-icons.js
npm run build

# Initialize iOS workspace if missing
if [ ! -d "src-tauri/gen/apple" ]; then
  echo "📱 Initializing Tauri iOS project in src-tauri/gen/apple..."
  npx tauri ios init --ci
else
  echo "📱 Tauri iOS workspace already initialized at src-tauri/gen/apple."
fi

# Check argument for simulator vs device build
TARGET_FLAG=""
if [[ "$1" == "--sim" || "$1" == "--simulator" ]]; then
  echo "🚀 Building for iOS Simulator..."
  TARGET_FLAG="--target aarch64-apple-ios-sim"
else
  echo "🚀 Building for iOS Device..."
fi

npx tauri ios build $TARGET_FLAG

echo ""
echo "=================================================="
echo "🎉 iOS Build Complete!"
echo "📁 Generated Xcode project: src-tauri/gen/apple/Arc Tracker.xcodeproj"
echo "💡 To test in Xcode or deploy to physical device:"
echo "   open \"src-tauri/gen/apple/Arc Tracker.xcodeproj\""
echo "=================================================="
