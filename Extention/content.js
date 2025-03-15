(function () {
  const uncensoredTweets = new Map();
  const uncensoredImages = new Map();
  let lastCallTimeTweets = 0;
  let lastCallTimeImages = 0;
  const cooldownTime = 5000; // 5 seconds cooldown
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
      return false;
    }
  }

  // Check if image contains NSFW content
  async function checkNSFWImage(imageUrl) {
    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl }),
      });
      const data = await response.json();
      return data && data.prediction === -1;
    } catch (error) {
      console.error("Error sending image to the server:", error);
      return false;
    }
  }

  async function extractTweets() {
    const currentTime = Date.now();
    if (currentTime - lastCallTimeTweets < cooldownTime) {
      console.log(
        "Cooldown active. Please wait before calling extractTweets again."
      );
      return;
    }
    lastCallTimeTweets = currentTime;

    let originalTweets = [];

    setTimeout(async () => {
      const tweetContainers = document.querySelectorAll("article");

      if (tweetContainers.length === 0) {
        console.log("No tweets found.");
        return;
      }

      const tweetDataPromises = Array.from(tweetContainers).map(
        async (tweet) => {
          const tweetTextElement = tweet.querySelector(
            'div[data-testid="tweetText"]'
          );
          let tweetText = tweetTextElement
            ? tweetTextElement.innerText.trim()
            : null;

          if (!tweetText) {
            return null;
          }

          originalTweets.push({
            element: tweetTextElement,
            originalText: tweetText,
          });
          const isTweetNSFW = await checkNSFW(tweetText);
          let censoredText = tweetText;

          if (isTweetNSFW) {
            let words = tweetText.split(/\s+/);
            censoredText = "";
            let hasCensoredWords = false;

            for (let i = 0; i < words.length; i++) {
              const word = words[i];
              const isNSFWWord = swearWordSet.has(word.toLowerCase());
              if (isNSFWWord) {
                hasCensoredWords = true;
                censoredText += (i > 0 ? " " : "") + "*".repeat(word.length);
              } else {
                censoredText += (i > 0 ? " " : "") + word;
              }
            }

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
          return {
            content: censoredText,
            username: "Unknown",
            timestamp: "Unknown",
          };
        }
      );

      const tweetData = (await Promise.all(tweetDataPromises)).filter(
        (tweet) => tweet !== null
      );
      console.log("Extracted Tweets:", tweetData);
    }, 1000);
  }

  async function extractImages() {
    const currentTime = Date.now();
    if (currentTime - lastCallTimeImages < cooldownTime) {
      console.log(
        "Cooldown active. Please wait before calling extractImages again."
      );
      return;
    }
    lastCallTimeImages = currentTime;

    let originalImages = [];

    setTimeout(async () => {
      const imageContainers = document.querySelectorAll("img");

      if (imageContainers.length === 0) {
        console.log("No images found.");
        return;
      }

      const imageDataPromises = Array.from(imageContainers).map(
        async (image) => {
          const imageUrl = image.src;
          if (!imageUrl) {
            return null;
          }

          originalImages.push({
            element: image,
            originalUrl: imageUrl,
          });
          const isImageNSFW = await checkNSFWImage(imageUrl);

          if (isImageNSFW) {
            image.style.filter = "blur(10px)";

            if (uncensoredImages.has(imageUrl)) {
              image.style.filter = "none";
            }

            if (!image.parentElement.querySelector(".uncensor-button")) {
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
                if (image.style.filter === "blur(10px)") {
                  image.style.filter = "none";
                  uncensoredImages.set(imageUrl, true);
                } else {
                  image.style.filter = "blur(10px)";
                  uncensoredImages.delete(imageUrl);
                }
              });
              image.parentElement.appendChild(uncensorButton);
            }
          }
          return {
            url: imageUrl,
            status: isImageNSFW ? "NSFW" : "SFW",
          };
        }
      );

      const imageData = (await Promise.all(imageDataPromises)).filter(
        (image) => image !== null
      );
      console.log("Extracted Images:", imageData);
    }, 1000);
  }

  async function init() {
    await loadSwearWords();
    extractTweets();
    extractImages();

    const observer = new MutationObserver(() => {
      console.log("Mutation observed, extracting tweets and images.");
      extractTweets();
      extractImages();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      const toggleSwitchState = result.toggleSwitchState;
      console.log(
        `Initial toggle switch state is ${toggleSwitchState ? "ON" : "OFF"}, extracting tweets and images.`
      );
      if (toggleSwitchState) {
        extractTweets();
        extractImages();
      }
    });

    window.addEventListener("load", () => {
      chrome.storage.sync.get(["toggleSwitchState"], (result) => {
        const toggleSwitchState = result.toggleSwitchState;
        console.log(
          `Page loaded, toggle switch state is ${toggleSwitchState ? "ON" : "OFF"}, extracting tweets and images.`
        );
        if (toggleSwitchState) {
          extractTweets();
          extractImages();
        }
      });
    });
  }

  init();
})();