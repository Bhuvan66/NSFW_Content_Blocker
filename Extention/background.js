// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tweets) {
    console.log("Tweets received:", message.tweets);

    // Send tweet text and images to the NSFW detection server
    fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tweets: message.tweets })
    })
      .then(response => response.json())
      .then(data => {
        console.log("Processed NSFW data:", data);
        sendResponse({ processedData: data });
      })
      .catch(error => {
        console.error("Error:", error);
        sendResponse({ error: "Failed to process NSFW data." });
      });

    return true; // Keep the message channel open for sendResponse
  }
});

// Set default toggle switch state when extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ toggleSwitchState: false }, () => {
    if (chrome.runtime.lastError) {
      console.error("Error setting default toggle switch state:", chrome.runtime.lastError);
    }
  });
});

// Listen for toggle switch state changes
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getToggleSwitchState") {
    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      sendResponse({ toggleSwitchState: result.toggleSwitchState || false });
    });
    return true; // Keep the message channel open for sendResponse
  }

  if (message.action === "setToggleSwitchState") {
    chrome.storage.sync.set({ toggleSwitchState: message.state }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error setting toggle switch state:", chrome.runtime.lastError);
      }
    });
  }
});

// Listen for tab updates to check if X (Twitter) is reloaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url.includes("x.com")) {
    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      if (result.toggleSwitchState) {
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ["content.js"],
        }).catch((error) => console.error("Error injecting content script:", error));
      }
    });
  }
});
