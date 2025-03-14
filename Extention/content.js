(function () {
  const uncensoredTweets = new Map();
  let lastCallTime = 0;
  const cooldownTime = 5000; // 5 seconds cooldown
  let swearWordSet = new Set(); // Use a Set for swear words

  // Function to load swear words from JSON
  async function loadSwearWords() {
    try {
      const url = chrome.runtime.getURL("swearWord.json"); // Fetch using correct URL
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

  // Call the function to load swear words
  loadSwearWords();

  async function extractTweets() {
    const currentTime = Date.now();
    if (currentTime - lastCallTime < cooldownTime) {
      console.log(
        "Cooldown active. Please wait before calling extractTweets again."
      );
      return;
    }
    lastCallTime = currentTime;

    let originalTweets = [];

    setTimeout(async () => {
      // Select all <article> tags (tweets are typically wrapped in them)
      const tweetContainers = document.querySelectorAll("article");

      if (tweetContainers.length === 0) {
        console.log("No tweets found.");
        return;
      }
      // Process all tweets asynchronously and wait for the results
      const tweetDataPromises = Array.from(tweetContainers).map(
        async (tweet) => {
          const tweetTextElement = tweet.querySelector(
            'div[data-testid="tweetText"]'
          );
          let tweetText = tweetTextElement
            ? tweetTextElement.innerText.trim()
            : null;

          // Skip this tweet if no content is found
          if (!tweetText) {
            return null;
          }
          // Storing tweet text for uncensoring later
          originalTweets.push({
            element: tweetTextElement,
            originalText: tweetText,
          });
          const isTweetNSFW = await checkNSFW(tweetText);
          let censoredText = tweetText; // Initialize censoredText with original text

          if (isTweetNSFW) {
            let words = tweetText.split(/\s+/);
            censoredText = "";
            let hasCensoredWords = false;

            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              const isNSFWWord = swearWordSet.has(word.toLowerCase()); // Check against the Set
              if (isNSFWWord) {
                hasCensoredWords = true;
                censoredText += (i > 0 ? " " : "") + "*".repeat(word.length);
              } else {
                censoredText += (i > 0 ? " " : "") + word;
              }
            }
            // Check if the tweet was previously uncensored
            if (uncensoredTweets.has(tweetText)) {
              tweetTextElement.innerText = tweetText;
            } else {
              tweetTextElement.innerText = censoredText;
            }

            if (
              hasCensoredWords &&
              !tweetTextElement.parentElement.querySelector(".uncensor-button")
            ) {
              const uncensorButton = document.createElement("button");
              uncensorButton.innerText = "🚫";
              uncensorButton.classList.add("uncensor-button");
              uncensorButton.style.marginLeft = "5px";
              uncensorButton.style.fontSize = "12px";
              uncensorButton.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
              uncensorButton.style.border = "none";
              uncensorButton.style.cursor = "pointer";
              uncensorButton.style.width = "20px";
              uncensorButton.style.height = "20px";

              uncensorButton.addEventListener("click", () => {
                if (tweetTextElement.innerText === censoredText) {
                  tweetTextElement.innerText = tweetText; // Reveal original text
                  uncensoredTweets.set(tweetText, true); // Mark tweet as uncensored
                } else {
                  tweetTextElement.innerText = censoredText; // Revert to censored text
                  uncensoredTweets.delete(tweetText); // Mark tweet as censored
                }
              });
              // Append the uncensor button next to the tweet text element
              tweetTextElement.parentElement.appendChild(uncensorButton);
            }
          }
          // Return tweet content, username, and timestamp as an object
          return {
            content: censoredText,
            username: "Unknown",
            timestamp: "Unknown",
          };
        }
      );
      // Wait for all tweets to be processed and filter out null results
      const tweetData = (await Promise.all(tweetDataPromises)).filter(
        (tweet) => tweet !== null
      );
      console.log("Extracted Tweets:", tweetData);
    }, 1000);
  }
  // Function to send words to the server for NSFW classification
  async function checkNSFW(text) {
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: [{ text: text }] }),
      });
      const data = await response.json();
      return data && data[0].label === "nsfw";
    } catch (error) {
      console.error("Error sending text to the server:", error);
      return false; // In case of error, assume tweet is safe
    }
  }
  // Call the function to extract and censor tweets initially
  extractTweets();

  const observer = new MutationObserver(() => {
    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      if (result.toggleSwitchState) {
        extractTweets();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
  // Check the initial state of the toggle switch
  chrome.storage.sync.get(["toggleSwitchState"], (result) => {
    if (result.toggleSwitchState) {
      extractTweets();
    }
  });
  // Call extractTweets once when the page loads if the checkbox is checked
  window.addEventListener("load", () => {
    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      if (result.toggleSwitchState) {
        extractTweets();
      }
    });
  });
})();
