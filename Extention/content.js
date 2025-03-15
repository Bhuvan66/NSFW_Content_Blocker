// (function () {
//   const uncensoredTweets = new Map();
//   let lastCallTime = 0;
//   const cooldownTime = 5000; // 5 seconds cooldown
//   let swearWordSet = new Set(); // Use a Set for swear words

//   // Function to load swear words from JSON
//   async function loadSwearWords() {
//     try {
//       const url = chrome.runtime.getURL("swearWord.json"); // Fetch using correct URL
//       const response = await fetch(url);
//       if (!response.ok)
//         throw new Error(`HTTP error! Status: ${response.status}`);

//       const swearWords = await response.json();
//       swearWordSet = new Set(swearWords);
//       console.log("Swear words loaded successfully:", swearWordSet);
//     } catch (error) {
//       console.error("Error loading swear words:", error);
//     }
//   }

//   // Call the function to load swear words
//   loadSwearWords();

//   async function extractTweets() {
//     const currentTime = Date.now();
//     if (currentTime - lastCallTime < cooldownTime) {
//       console.log(
//         "Cooldown active. Please wait before calling extractTweets again."
//       );
//       return;
//     }
//     lastCallTime = currentTime;

//     let originalTweets = [];

//     setTimeout(async () => {
//       const tweetContainers = document.querySelectorAll("article");

//       if (tweetContainers.length === 0) {
//         console.log("No tweets found.");
//         return;
//       }

//       const tweetDataPromises = Array.from(tweetContainers).map(
//         async (tweet) => {
//           const tweetTextElement = tweet.querySelector(
//             'div[data-testid="tweetText"]'
//           );
//           let tweetText = tweetTextElement
//             ? tweetTextElement.innerText.trim()
//             : null;

//           if (!tweetText) {
//             return null;
//           }

//           originalTweets.push({
//             element: tweetTextElement,
//             originalText: tweetText,
//           });
//           const isTweetNSFW = await checkNSFW(tweetText);
//           let censoredText = tweetText;

//           if (isTweetNSFW) {
//             let words = tweetText.split(/\s+/);
//             censoredText = "";
//             let hasCensoredWords = false;

//             for (let i = 0; i < words.length; i++) {
//               const word = words[i];
//               const isNSFWWord = swearWordSet.has(word.toLowerCase());
//               if (isNSFWWord) {
//                 hasCensoredWords = true;
//                 censoredText += (i > 0 ? " " : "") + "*".repeat(word.length);
//               } else {
//                 censoredText += (i > 0 ? " " : "") + word;
//               }
//             }

//             if (uncensoredTweets.has(tweetText)) {
//               tweetTextElement.innerText = tweetText;
//             } else {
//               tweetTextElement.innerText = censoredText;
//             }

//             if (
//               hasCensoredWords &&
//               !tweetTextElement.parentElement.querySelector(".uncensor-button")
//             ) {
//               const uncensorButton = document.createElement("button");
//               uncensorButton.innerText = "🚫";
//               uncensorButton.classList.add("uncensor-button");
//               uncensorButton.style.marginLeft = "5px";
//               uncensorButton.style.fontSize = "12px";
//               uncensorButton.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
//               uncensorButton.style.border = "none";
//               uncensorButton.style.cursor = "pointer";
//               uncensorButton.style.width = "20px";
//               uncensorButton.style.height = "20px";

//               uncensorButton.addEventListener("click", () => {
//                 if (tweetTextElement.innerText === censoredText) {
//                   tweetTextElement.innerText = tweetText;
//                   uncensoredTweets.set(tweetText, true);
//                 } else {
//                   tweetTextElement.innerText = censoredText;
//                   uncensoredTweets.delete(tweetText);
//                 }
//               });
//               tweetTextElement.parentElement.appendChild(uncensorButton);
//             }
//           }
//           return {
//             content: censoredText,
//             username: "Unknown",
//             timestamp: "Unknown",
//           };
//         }
//       );

//       const tweetData = (await Promise.all(tweetDataPromises)).filter(
//         (tweet) => tweet !== null
//       );
//       console.log("Extracted Tweets:", tweetData);
//     }, 1000);
//   }

//   async function checkNSFW(text) {
//     try {
//       const response = await fetch("http://127.0.0.1:5000/analyze", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ tweets: [{ text: text }] }),
//       });
//       const data = await response.json();
//       return data && data[0].label === "nsfw";
//     } catch (error) {
//       console.error("Error sending text to the server:", error);
//       return false;
//     }
//   }

//   extractTweets();

//   const observer = new MutationObserver(() => {
//     chrome.storage.sync.get(["toggleSwitchState"], (result) => {
//       if (result.toggleSwitchState) {
//         extractTweets();
//       }
//     });
//   });

//   observer.observe(document.body, { childList: true, subtree: true });

//   chrome.storage.sync.get(["toggleSwitchState"], (result) => {
//     if (result.toggleSwitchState) {
//       extractTweets();
//     }
//   });

//   window.addEventListener("load", () => {
//     chrome.storage.sync.get(["toggleSwitchState"], (result) => {
//       if (result.toggleSwitchState) {
//         extractTweets();
//       }
//     });
//   });
// })();

(function () {
  const uncensoredTweets = new Map();
  const uncensoredImages = new Map();
  let lastCallTimeTweets = 0;
  let lastCallTimeImages = 0;
  const cooldownTime = 3000; // Reduced to 3 seconds for better updates
  let swearWordSet = new Set(); // Store swear words for filtering

  // Function to load swear words from JSON
  async function loadSwearWords() {
    try {
      const url = chrome.runtime.getURL("swearWord.json");
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);

      const swearWords = await response.json();
      swearWordSet = new Set(swearWords);
      console.log("Swear words loaded successfully:", swearWordSet);
    } catch (error) {
      console.error("Error loading swear words:", error);
    }
  }

  // Check if text contains NSFW content
  function checkNSFW(text) {
    return [...swearWordSet].some((word) => text.toLowerCase().includes(word));
  }

  // Function to process tweets
  function processTweets() {
    const currentTime = Date.now();
    if (currentTime - lastCallTimeTweets < cooldownTime) return;
    lastCallTimeTweets = currentTime;

    document.querySelectorAll("article").forEach((tweet) => {
      const tweetTextElement = tweet.querySelector(
        'div[data-testid="tweetText"]'
      );
      if (!tweetTextElement) return;

      let tweetText = tweetTextElement.innerText.trim();
      if (!tweetText) return;

      const isTweetNSFW = checkNSFW(tweetText);
      let censoredText = tweetText;

      if (isTweetNSFW) {
        censoredText = censorText(tweetText);
        tweetTextElement.innerText = uncensoredTweets.has(tweetText)
          ? tweetText
          : censoredText;

        if (!tweetTextElement.parentElement.querySelector(".uncensor-button")) {
          const uncensorButton = createButton();
          uncensorButton.addEventListener("click", () => {
            if (tweetTextElement.innerText === censoredText) {
              tweetTextElement.innerText = tweetText;
              uncensoredTweets.set(tweetText, true);
            } else {
              tweetTextElement.innerText = censoredText;
              uncensoredTweets.delete(tweetText);
            }
          });
          tweetTextElement.parentElement.appendChild(uncensorButton);
        }
      }
    });
  }

  // Function to process images
  function processImages() {
    const currentTime = Date.now();
    if (currentTime - lastCallTimeImages < cooldownTime) return;
    lastCallTimeImages = currentTime;

    document.querySelectorAll("img").forEach(async (image) => {
      const imageUrl = image.src;
      if (!imageUrl || uncensoredImages.has(imageUrl)) return;

      try {
        const response = await fetch("http://127.0.0.1:5000/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const data = await response.json();
        const isImageNSFW = data.prediction === -1;

        if (isImageNSFW) {
          image.style.filter = "blur(10px)";

          if (!image.parentElement.querySelector(".uncensor-button")) {
            const uncensorButton = createButton();
            uncensorButton.addEventListener("click", () => {
              if (image.style.filter === "blur(10px)") {
                image.style.filter = "none";
                uncensoredImages.set(imageUrl, true);
              } else {
                image.style.filter = "blur(10px)";
                uncensoredImages.delete(imageUrl);
              }
            });

            if (image.parentElement) {
              image.parentElement.appendChild(uncensorButton);
            } else {
              console.warn("No parent found for image:", imageUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error processing image:", imageUrl, error);
      }
    });
  }

  // Censor Text Function
  function censorText(text) {
    return text
      .split(" ")
      .map((word) =>
        swearWordSet.has(word.toLowerCase()) ? "*".repeat(word.length) : word
      )
      .join(" ");
  }

  // Create Button Function
  function createButton() {
    const button = document.createElement("button");
    button.innerText = "Uncensor";
    button.className = "uncensor-button";
    button.style.cssText = `
      background-color: red; 
      color: white; 
      border: none; 
      padding: 5px 10px; 
      font-size: 12px; 
      cursor: pointer;
      margin-left: 10px;
    `;
    return button;
  }

  // Observe page for changes (new tweets and images)
  function observeChanges() {
    const observer = new MutationObserver(() => {
      processTweets();
      processImages();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  // Initialize Extension
  async function init() {
    await loadSwearWords();
    observeChanges();
  }

  init();
})();
