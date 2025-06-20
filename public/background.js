chrome.runtime.onInstalled.addListener(() => {
  console.log("Smart Website Blocker installed ✅");
  chrome.storage.local.set({ blockedSites: [] });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    chrome.storage.local.get(["blockedSites"], (result) => {
      const blocked = result.blockedSites || [];

      const shouldBlock = blocked.some(site => tab.url.includes(site));

      if (shouldBlock) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"]
        });
      }
    });
  }
});
