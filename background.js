// Set visual state of the extension badge/icon
const updateBadge = (isEnabled) => {
  chrome.action.setBadgeText({ text: isEnabled ? "ON" : "OFF" });
  chrome.action.setBadgeBackgroundColor({ color: isEnabled ? "#2196F3" : "#666666" });
};

// Initialize badge state on startup
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({ darkModeElement: true }, (data) => {
    updateBadge(data.darkModeElement);
  });
});

// Listen for clicks directly on the browser extension icon
chrome.action.onClicked.addListener(() => {
  chrome.storage.local.get({ darkModeElement: true }, (data) => {
    const nextState = !data.darkModeElement;
    
    // Save state and update UI
    chrome.storage.local.set({ darkModeElement: nextState }, () => {
      updateBadge(nextState);
      
      // Reload current active tab to apply changes instantly
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.reload(tabs[0].id);
        }
      });
    });
  });
});
