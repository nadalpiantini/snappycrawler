# Snappy Chrome Extension v2.0

## Features

- ✅ Capture complete HTML structure
- ✅ Extract visible text (deduplicated)
- ✅ Track UX events (clicks, form submissions)
- ✅ Auto-download as JSON
- ✅ Zero permissions needed beyond activeTab

## Installation

### Developer Mode

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `extension/` directory

### Verify Installation

Look for the 📸 Snappy icon in your Chrome toolbar

## Usage

### Basic Capture

1. Navigate to any webpage
2. Click the Snappy extension icon
3. Snapshot downloads automatically as `snappy-<hostname>-<timestamp>.json`

### With UX Tracking

1. Navigate to webpage
2. Interact with the page (click buttons, fill forms, etc.)
3. Click Snappy icon
4. Snapshot includes all UX events you performed

### Upload to Snappy Platform

1. Go to https://snappy.dev
2. Drag & drop the JSON file
3. View normalized structure and legal-safe version

## Output Format

```json
{
  "url": "https://example.com",
  "title": "Example Page",
  "html": "<html>...</html>",
  "text": ["Heading 1", "Paragraph text", ...],
  "ux": [
    {
      "type": "click",
      "tag": "BUTTON",
      "text": "Submit",
      "id": null,
      "class": "btn-primary"
    }
  ],
  "meta": {
    "viewport": { "width": 1920, "height": 1080 },
    "timestamp": "2025-01-25T10:00:00Z"
  }
}
```

## Icons Needed

Create these icons in `extension/icons/`:

- `icon16.png` - 16x16px
- `icon48.png` - 48x48px
- `icon128.png` - 128x128px

Recommended: Use a camera/snapshot icon with blue branding

## Privacy

- ❌ No tracking
- ❌ No data sent to external servers
- ❌ No background scripts running
- ✅ Everything stays local on your machine
- ✅ Open source and auditable

## Troubleshooting

### Extension not working?
- Check Developer Mode is enabled
- Try reloading the extension
- Check console for errors

### Snapshot incomplete?
- Some sites block script injection (CSP)
- Try on a different page
- Check browser console for errors

### UX events not captured?
- Interact with the page AFTER loading it
- Some SPAs may have timing issues
- Refresh and try again

## License

MIT License - Part of Snappy Platform
