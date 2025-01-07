// Trigger tweet extraction
document.getElementById("read-tweets").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        files: ["content.js"],
      });
    }
  });

  document.getElementById("output").innerText = "Tweets extracted! Check  console.";
});

// func for resuablity
function showNotXMessage() {
  document.body.innerHTML = "";

  // Create a container for the messages
  const container = document.createElement('div');
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    font-family: Arial, sans-serif;
    background-color: #09090b;
        color: #be185d;
  `;
  

  const oopsText = document.createElement('div');
  oopsText.innerText = "oopsiee!!!";
  oopsText.style.cssText = `
    font-size: 36px;
    font-weight: bold;
  `;
  
  // Create and style the "This is not X.com" text
  const notXText = document.createElement('div');
  notXText.innerText = "This is not X.com";
  notXText.style.cssText = `
    font-size: 24px;
  `;
  
  container.appendChild(oopsText);
  container.appendChild(notXText);
  
  // Append the container to the body
  document.body.appendChild(container);
}

// Prevent popup if the site is not x.com
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs && tabs.length > 0 && tabs[0].url.startsWith("chrome://")) {
    showNotXMessage();
    return;
  }

  chrome.scripting.executeScript(
    {
      target: { tabId: tabs[0].id },
      func: () => window.location.hostname,
    },
    (results) => {
      if (chrome.runtime.lastError || !results || results.length === 0 || results[0].result.toLowerCase() !== "x.com") {
        showNotXMessage();
      }
    }
  );
});

document.addEventListener("DOMContentLoaded", () => {
  const toggleSwitch = document.querySelector(".toggle-switch input");
  const readTweetButton = document.getElementById("read-tweets");

  if (toggleSwitch) {
    toggleSwitch.addEventListener("change", () => {
      readTweetButton.style.visibility = toggleSwitch.checked ? "hidden" : "visible";
    });
  }
});

// // Trigger tweet extraction
// document.getElementById("read-tweets").addEventListener("click", () => {
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs && tabs.length > 0) {
//       chrome.scripting.executeScript({
//         target: { tabId: tabs[0].id },
//         files: ["content.js"],
//       });
//     }
//   });

//   // Optional: Show a confirmation message
//   document.getElementById("output").innerText = "Tweets extracted! Check the console.";
// });

// // using fuc fr reusability
// function showNotXMessage() {
//   document.body.innerHTML = "";
//   document.body.innerText = "ooopss!! This is not X.com";
//   document.body.style.cssText = `
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     height: 100vh;
//     width:100vh;
//     font-size: 24px;
//     color:#be185d;
//     //  #7e22ce;
//     background-color: #09090b;
//     font-family: Arial, sans-serif;
//   `;
// }

// // Prevent popup if the site is not x.com
// chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//   if (tabs && tabs.length > 0 && tabs[0].url.startsWith("chrome://")) {
//     showNotXMessage();
//     return;
//   }

//   chrome.scripting.executeScript(
//     {
//       target: { tabId: tabs[0].id },
//       func: () => window.location.hostname,
//     },
//     (results) => {
//       if (chrome.runtime.lastError || !results || results.length === 0 || results[0].result.toLowerCase() !== "x.com") {
//         showNotXMessage();
//       }
//     }
//   );
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const toggleSwitch = document.querySelector(".toggle-switch input");
//   const readTweetButton = document.getElementById("read-tweets");

//   if (toggleSwitch) {
//     toggleSwitch.addEventListener("change", () => {
//       readTweetButton.style.visibility = toggleSwitch.checked ? "hidden" : "visible";
//     });
//   }
// });