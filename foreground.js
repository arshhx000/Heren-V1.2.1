document.addEventListener('copy', function(e) {
  // Get the selected text
  let selectedText = window.getSelection().toString().trim();
  
  // Fallback: If empty, check if user is copying from an input or textarea
  if (!selectedText && document.activeElement) {
    const el = document.activeElement;
    if ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && el.selectionStart !== undefined) {
      selectedText = el.value.substring(el.selectionStart, el.selectionEnd).trim();
    }
  }
  
  if (selectedText) {
    // Get current time for timestamp
    const timestamp = new Date().getTime();
    // Get website name/title
    const websiteTitle = document.title || window.location.hostname;
    
    // Save to Chrome storage
    chrome.storage.local.get(['copiedTexts'], function(result) {
      let copiedTexts = result.copiedTexts;
      if (!Array.isArray(copiedTexts)) {
        copiedTexts = [];
      }
      console.log("Heren V2: Saving copied text ->", selectedText.substring(0, 20) + "...");
      
      // Ensure array is sorted newest-first so quota logic works perfectly
      copiedTexts.sort((a, b) => b.timestamp - a.timestamp);
      
      // Add new item to the beginning
      copiedTexts.unshift({
        text: selectedText,
        website: websiteTitle,
        timestamp: timestamp,
        expiryTime: timestamp + (6 * 60 * 60 * 1000) // 6 hours in milliseconds
      });
      
      // Storage Quota Protection: Keep only the 50 most recent entries
      if (copiedTexts.length > 50) {
        copiedTexts = copiedTexts.slice(0, 50);
      }
      
      chrome.storage.local.set({ copiedTexts: copiedTexts });
    });
  }
}, true);
