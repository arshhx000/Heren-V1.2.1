document.addEventListener('copy', function(e) {
  // Get the selected text
  const selectedText = window.getSelection().toString().trim();
  
  if (selectedText) {
    // Get current time for timestamp
    const timestamp = new Date().getTime();
    // Get website name/title
    const websiteTitle = document.title || window.location.hostname;
    
    // Save to Chrome storage
    chrome.storage.local.get(['copiedTexts'], function(result) {
      const copiedTexts = result.copiedTexts || [];
      
      copiedTexts.push({
        text: selectedText,
        website: websiteTitle,
        timestamp: timestamp,
        expiryTime: timestamp + (6 * 60 * 60 * 1000) // 6 hours in milliseconds
      });
      
      chrome.storage.local.set({ copiedTexts: copiedTexts });
    });
  }
});
