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
