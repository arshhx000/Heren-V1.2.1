// Set up an alarm to check for expired texts every minute
chrome.alarms.create('cleanupExpiredTexts', { periodInMinutes: 1 });

// Listen for the alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupExpiredTexts') {
    cleanupExpiredTexts();
  }
});

// Function to remove expired texts
function cleanupExpiredTexts() {
  const currentTime = new Date().getTime();
  
  chrome.storage.local.get(['copiedTexts'], function(result) {
    if (!result.copiedTexts) return;
    
    const updatedTexts = result.copiedTexts.filter(item => {
      return item.expiryTime > currentTime;
    });
    
    chrome.storage.local.set({ copiedTexts: updatedTexts });
  });
}

// First-time install guide
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    const timestamp = new Date().getTime();
    
    // A quick sample copied text
    const sampleCopiedText = {
      text: "👋 This is a sample copied text! Highlight and copy (Ctrl+C) anything on the web and it will automatically appear here.",
      website: "Heren V2 Onboarding",
      timestamp: timestamp,
      expiryTime: timestamp + (365 * 24 * 60 * 60 * 1000) // 1 year expiry
    };
    
    // The comprehensive guide saved in the Keep (savedNotes)
    const keepGuide = {
      content: "👋 Welcome to Heren Keep V2!\n\nHere is your quick guide to mastering the extension:\n\n⌨️ SHORTCUTS\n• Open Heren V2 from anywhere: Ctrl + Shift + H\n\n✂️ AUTO-SAVING\nAny text you highlight and copy on the web is automatically saved. We keep your latest 50 copies safe.\n\n📄 PDFs & STRICT SITES\nNormal copying won't work inside PDF files or sites like Perplexity. Instead, highlight the text, RIGHT-CLICK, and select 'Save to Heren Keep' from the menu!\n\n⚠️ BROWSER SETTINGS PAGES\nChrome/Brave intentionally blocks extensions from running on their settings pages (like brave://extensions). You must test Heren on normal websites!\n\n📝 THE KEEP\nThis section is 'The Keep'. You can use it to write down permanent manual notes. Just click the red 'KEEP' button above.\n\n⬇️ EXPORT JSON\nClick the small 'EXPORT JSON' button above your copied texts to download an offline backup of all your data.\n\n🔍 SEARCH & DARK MODE\n• Use the search bar to instantly filter through your texts and notes.\n• Click the ☾ / ☼ icon to toggle Dark Mode.\n\nClick the 'X' button on this note to delete this guide forever!",
      timestamp: timestamp
    };
    
    chrome.storage.local.set({ 
      copiedTexts: [sampleCopiedText],
      savedNotes: [keepGuide]
    });
  }

  // Create the right-click context menu (Run on every install/update)
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "save-to-heren",
      title: "Save to Heren Keep",
      contexts: ["selection"]
    });
  });
});

// Handle right-click context menu clicks (Crucial for PDFs and strict sites)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-to-heren" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    if (!selectedText) return;

    const timestamp = new Date().getTime();
    // In PDFs, the tab title is usually the file name
    const websiteTitle = tab ? (tab.title || new URL(tab.url).hostname) : "PDF / Web Page";

    chrome.storage.local.get(['copiedTexts'], function(result) {
      let copiedTexts = result.copiedTexts;
      if (!Array.isArray(copiedTexts)) copiedTexts = [];
      
      copiedTexts.sort((a, b) => b.timestamp - a.timestamp);
      
      copiedTexts.unshift({
        text: selectedText,
        website: websiteTitle,
        timestamp: timestamp,
        expiryTime: timestamp + (6 * 60 * 60 * 1000)
      });
      
      if (copiedTexts.length > 50) {
        copiedTexts = copiedTexts.slice(0, 50);
      }
      
      chrome.storage.local.set({ copiedTexts: copiedTexts });
    });
  }
});
