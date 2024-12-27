// Trigger tweet extraction
document.getElementById("read-tweets").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"]
      });
    });
  
    // Optional: Show a confirmation message
    document.getElementById("output").innerText = "Tweets extracted! Check the console.";
  });
  