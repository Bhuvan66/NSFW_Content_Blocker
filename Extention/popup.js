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

   // Prevent popup if the site is not x.com
   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0].url.startsWith("chrome://")) {
      document.body.innerHTML = ""; // Hide all elements
      document.body.innerText = "This is not X.com";
      return;
    }
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => window.location.hostname
      },
      (results) => {
        if (results[0].result === "x.com") {
          // Your code to execute if the site is x.com
        } else {
          document.body.innerHTML = ""; // Hide all elements
          document.body.innerText = "This is not X.com";
        }
      }
    );
  });