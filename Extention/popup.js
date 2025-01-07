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

        } else {
          document.body.innerHTML = ""; // Hide all elements
          document.body.innerText = "This is not X.com";
        }
      }
    );
  });

  document.addEventListener('DOMContentLoaded', () => {
    const toggleSwitch = document.querySelector('.toggle-switch input');
    const readTweetButton = document.getElementById('read-tweets');
  
    toggleSwitch.addEventListener('change', () => {
      if (toggleSwitch.checked) {
        readTweetButton.style.visibility = 'hidden';
      } else {
        readTweetButton.style.visibility = 'visible';
      }
    });
  });
  

