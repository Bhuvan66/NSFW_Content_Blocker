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
  