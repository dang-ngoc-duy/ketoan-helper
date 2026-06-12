#!/bin/bash
# Generate simple PNG icons using ImageMagick (if available) or base64 fallback

if command -v convert &> /dev/null; then
  for size in 16 48 128; do
    convert -size ${size}x${size} xc:'#3498db' \
      -fill white \
      -draw "rectangle $((size/5)),$((size/5)) $((size*4/5)),$((size*2/5))" \
      -draw "rectangle $((size/5)),$((size/2)) $((size*2/5)),$((size*7/10))" \
      -draw "rectangle $((size/2)),$((size/2)) $((size*7/10)),$((size*7/10))" \
      -draw "rectangle $((size*4/5-size/5)),$((size/2)) $((size*4/5)),$((size*7/10))" \
      icon${size}.png
  done
  echo "Icons generated using ImageMagick"
else
  echo "ImageMagick not found. Creating placeholder icons..."
  # Create minimal base64 PNG placeholders
  for size in 16 48 128; do
    # Minimal 1x1 blue PNG, will be upscaled
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon${size}.png
  done
  echo "Placeholder icons created"
fi
