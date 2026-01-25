#!/bin/bash

echo "📸 Snappy Extension Diagnostic"
echo "================================"
echo ""

EXT_DIR="extension"

echo "✅ Checking files..."
if [ -f "$EXT_DIR/manifest.json" ]; then
  echo "   ✅ manifest.json exists"
else
  echo "   ❌ manifest.json NOT FOUND"
fi

if [ -f "$EXT_DIR/content.js" ]; then
  echo "   ✅ content.js exists"
else
  echo "   ❌ content.js NOT FOUND"
fi

if [ -d "$EXT_DIR/icons" ]; then
  echo "   ✅ icons/ directory exists"
  echo "   Icon files:"
  ls -lh "$EXT_DIR/icons/"
else
  echo "   ❌ icons/ directory NOT FOUND"
fi

echo ""
echo "📋 Manifest validation:"
cat "$EXT_DIR/manifest.json" | python3 -m json.tool > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ manifest.json is valid JSON"
else
  echo "   ❌ manifest.json has JSON syntax errors"
fi

echo ""
echo "🔧 Common fixes:"
echo "1. If you see 'Manifest key must be declared' - check Chrome version"
echo "2. If you see 'File not found' - verify all files exist"
echo "3. If you see 'Permission denied' - check file permissions"
echo ""

echo "📝 To load extension:"
echo "1. Open chrome://extensions/"
echo "2. Enable 'Developer mode' (top right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select: $(pwd)/extension"
echo ""
