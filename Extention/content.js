(function () {
  const uncensoredTweets = new Map();
  let lastCallTime = 0;
  const cooldownTime = 5000;
  let swearWordSet = new Set();

  async function loadSwearWords() {
    try {
      const url = chrome.runtime.getURL("swearWord.json");
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const swearWords = await response.json();
      swearWordSet = new Set(swearWords);
      console.log("Swear words loaded successfully:", swearWordSet);
    } catch (error) {
      console.error("Error loading swear words:", error);
    }
  }

  loadSwearWords();

  async function extractTweets() {
    const currentTime = Date.now();
    if (currentTime - lastCallTime < cooldownTime) {
      console.log("Cooldown active. Please wait before calling extractTweets again.");
      return;
    }
    lastCallTime = currentTime;

    setTimeout(async () => {
      const tweetContainers = document.querySelectorAll("article");

      if (tweetContainers.length === 0) {
        console.log("No tweets found.");
        return;
      }

      const tweetDataPromises = Array.from(tweetContainers).map(async (tweet) => {
        const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
        let tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : null;

        // Extract images
        const imageElements = tweet.querySelectorAll('img');
        let imageUrls = Array.from(imageElements).map(img => img.src);

        console.log("Detected images:", imageUrls);  //  Log detected images

        if (!tweetText && imageUrls.length === 0) {
          console.log("No text or images found in this tweet.");
          return null;
        }

        // Simulate NSFW detection
        const isTweetNSFW = await checkNSFW(tweetText, imageUrls);

        // Blur images if NSFW
        imageElements.forEach(img => {
          if (isTweetNSFW) {
            img.style.filter = "blur(10px)";
            img.style.transition = "filter 0.3s";
            console.log("Blurring image:", img.src);  // Log blurring

            const revealButton = document.createElement("button");
            revealButton.innerText = "🔓";
            revealButton.style.marginLeft = "5px";
            revealButton.style.cursor = "pointer";
            revealButton.addEventListener("click", () => {
              img.style.filter = "none";
              console.log("Unblurring image:", img.src);
            });

            img.parentElement.appendChild(revealButton);
          }
        });

        return { content: tweetText, images: imageUrls };
      });

      const tweetData = (await Promise.all(tweetDataPromises)).filter(tweet => tweet !== null);
      console.log("Extracted Tweets:", tweetData);
    }, 1000);

  }

  function blurImage(imgElement) {
    imgElement.style.filter = "blur(10px)";
    imgElement.style.transition = "filter 0.3s";
    console.log("Blurring image:", img.src);

    const revealButton = document.createElement("button");
    revealButton.innerText = "🔓";
    revealButton.style.marginLeft = "5px";
    revealButton.style.cursor = "pointer";
    revealButton.addEventListener("click", () => imgElement.style.filter = "none");

    imgElement.parentElement.appendChild(revealButton);
  }

  async function checkNSFW(text, imageUrls) {
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tweets: [{ text, images: imageUrls }] })
      });
      const data = await response.json();
      return data && (data[0].label === "nsfw" || data[0].label === "-1");
    } catch (error) {
      console.error("Error sending data to the server:", error);
      return false;
    }
  }

  extractTweets();

  const observer = new MutationObserver(() => {
    console.log("DOM updated, checking for new tweets...");
    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      if (result.toggleSwitchState) {
        extractTweets();
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  chrome.storage.sync.get(["toggleSwitchState"], (result) => {
    if (result.toggleSwitchState) extractTweets();
  });

  window.addEventListener("load", () => {
    chrome.storage.sync.get(["toggleSwitchState"], (result) => {
      if (result.toggleSwitchState) extractTweets();
    });
  });
})();
