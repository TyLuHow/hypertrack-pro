# PWA Icon Requirements

## Missing Icon Files

The following icon files are required for full PWA functionality but are not included in the repository:

### Required Files
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

### How to Add Icons

#### Option 1: Create Custom Icons
1. Design icons with your preferred image editor
2. Export as PNG files with the exact dimensions above
3. Place files in the root directory of the project

#### Option 2: Use Placeholder Icons
You can create simple placeholder icons using any online icon generator:

1. Visit https://favicon.io/favicon-generator/
2. Create 192x192 and 512x512 PNG icons
3. Download and rename to `icon-192.png` and `icon-512.png`
4. Place in root directory

#### Option 3: Use Default Browser Icons
For development, the PWA will work without icons, but installation prompts may not appear on all devices.

### Icon Design Guidelines
- **Style**: Consistent with the HyperTrack Pro brand (dark theme, teal accent)
- **Content**: Simple fitness/muscle/barbell icon or "HT" text
- **Background**: Solid color or gradient that matches the app theme
- **Format**: PNG with transparency support

### Verification
After adding icons, verify they work by:
1. Loading the app in Chrome/Edge
2. Opening DevTools → Application → Manifest
3. Checking that icons load without errors
4. Testing PWA installation prompt

### Alternative: Auto-Generated Icons
The app will function without custom icons, but for the best user experience, add the icon files as described above.