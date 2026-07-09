# Heren Keep V2

**Heren Keep V2** is a modern, privacy-focused browser extension designed to enhance productivity by automatically saving your copied texts and allowing you to manually jot down notes. V2 introduces a completely revamped aesthetic, a soft-shadow glass UI, an automatic dark mode, and a highly compact layout.

## Features

- **Automatic Text Saving:** Quietly captures text you copy (`Ctrl+C`) anywhere on the web (even inside input fields and textboxes!) and saves it locally.
- **Smart Quota System:** Automatically manages your storage by keeping only your 50 most recent copies, preventing performance bloat.
- **Manual Notes ("Keep"):** Instantly jot down quick ideas or tasks that you don't want to lose using the "Keep" button.
- **Deep Search:** Search through both your copied texts and manual notes instantly, with smart highlighting.
- **Smart Truncation:** Long texts are automatically truncated at 100 words to keep your UI clean. Click `[...] READ MORE` to seamlessly expand them inline!
- **Dark Mode:** A beautiful built-in dark mode toggle (☼ / ☾) that remembers your preference.
- **Export to JSON:** Download a secure, offline backup of all your copied texts and manual notes with a single click.
- **Global Shortcut:** Access Heren Keep from any tab using the **`Ctrl+Shift+H`** hotkey.

## Installation Instructions

1. Open your Chromium-based browser (Chrome, Brave, Edge) and navigate to `chrome://extensions/` (or `brave://extensions/`).
2. Enable **Developer Mode** using the toggle in the top-right corner.
3. Click **Load unpacked** and select the extension folder.
4. *Important:* Make sure to allow any requested permissions if prompted (like accessing data on all sites) so the automatic copy-saving can function seamlessly across all web pages.

## Usage Guide

- **Copying:** Just browse the web and copy text like you normally would. Heren V2 intercepts it and stores it with the timestamp and website name.
- **Advanced Copying (PDFs & Strict Sites):** Normal `Ctrl+C` copying will not work inside PDF files or sites with strict copy-protection (like Perplexity/ChatGPT). Instead, highlight the text, **Right-Click**, and select **"Save to Heren Keep"** from the context menu to force-save it securely!
- **Shortcut:** Press `Ctrl+Shift+H` to immediately pull up the extension without clicking the icon. (Note: You can customize this in `chrome://extensions/shortcuts`).
- **Notes:** Click `KEEP` in the top right of the popup to open the note editor.

> [!WARNING]
> **Testing Limitations**
> Chrome and Brave intentionally block all extensions from running on their internal settings pages (like `brave://extensions` or `chrome://settings`). You **must** go to a normal website (like Wikipedia or Google) to test the auto-copying or right-click features!

## Tech Stack & Architecture

- **Manifest V3:** Fully compliant with the latest, strictest Chromium extension privacy and security standards.
- **Background Worker:** `service-worker.js` runs silently to manage background tasks.
- **Content Script:** `foreground.js` intercepts document-level copy events safely without interrupting the user's normal workflow.
- **UI:** Custom `Rubik` typography paired with a clean, soft-shadow modern design system written in pure HTML/CSS and vanilla JS.

## License

This project is licensed under the MIT License.
