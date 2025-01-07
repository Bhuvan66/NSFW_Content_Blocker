// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.tweets) {
      console.log("Tweets received:", message.tweets);
  
      // Example: Process tweets or send to an external server
      fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: message.tweets })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Processed data:", data);
      })
      .catch(error => console.error("Error:", error));
    }
  });

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ toggleSwitchState: false });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getToggleSwitchState") {
    chrome.storage.sync.get(['toggleSwitchState'], (result) => {
      sendResponse({ toggleSwitchState: result.toggleSwitchState });
    });
    return true; // Keep the message channel open for sendResponse
  } else if (message.action === "setToggleSwitchState") {
    chrome.storage.sync.set({ toggleSwitchState: message.state });
  }
});
