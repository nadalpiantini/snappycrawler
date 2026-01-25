# Snappy Bookmarklet - Mobile Alternative

## What is a Bookmarklet?

A bookmarklet is a small piece of JavaScript stored as a URL in your browser's bookmarks bar. It lets you add functionality to any webpage.

## Installation

### Method 1: Drag & Drop (Easiest)

1. Copy this code:
```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://snappy.dev/bookmarklet/snapshot.js';document.body.appendChild(s);})();
```

2. Create a new bookmark
3. Name it "📸 Snappy"
4. Paste the code as the URL

### Method 2: Manual

1. Create a new bookmark
2. Name: "📸 Snappy Capture"
3. URL: Copy the minified code from `snapshot.min.js`

## Usage

### Desktop
1. Navigate to any webpage
2. Click the "📸 Snappy" bookmark
3. Snappy UI appears in bottom-right corner
4. Click "Capture Snapshot"
5. JSON downloads automatically

### Mobile (Safari/Chrome)
1. Navigate to webpage
2. Open bookmarks and tap "📸 Snappy"
3. Tap "Capture Snapshot"
4. JSON downloads to Downloads folder

## Features

- ✅ Works on mobile (no extension needed)
- ✅ Tracks UX events (clicks, forms)
- ✅ Captures complete HTML
- ✅ Extracts visible text
- ✅ One-click capture
- ✅ Auto-download JSON

## Limitations

- ⚠️ Must be run on each page load
- ⚠️ Some sites block bookmarklets via CSP
- ⚠️ UI overlays on page content
- ⚠️ Not as seamless as Chrome extension

## Troubleshooting

### Bookmark not working?
- Make sure the bookmark starts with `javascript:`
- Check your browser allows bookmarklets
- Try on a different page

### Snapshot not downloading?
- Check browser downloads settings
- Try on a desktop browser first
- Check console for errors (F12)

### UI not appearing?
- Bookmarklet might be blocked by CSP
- Try the Chrome extension instead
- Check browser console for errors

## Code Structure

The bookmarklet:
1. Attaches UX event listeners
2. Creates floating UI
3. Captures snapshot on button click
4. Downloads JSON file

All client-side, no server needed.

## Minified Version

Use this minified version for the bookmark URL:

```javascript
javascript:(function(){var s=document.createElement('script');s.src='https://snappy.dev/bookmarklet/snapshot.js';document.body.appendChild(s);})();
```

## License

MIT License - Part of Snappy Platform
