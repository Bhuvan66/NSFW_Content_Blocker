(function () {

  async function extractTweets() {

    let originalTweets = [];

    setTimeout(async () => {
      // Select all <article> tags (tweets are typically wrapped in them)
      const tweetContainers = document.querySelectorAll("article");

      if (tweetContainers.length === 0) {
        console.log("no tweeetttoooo.");
        return;
      }

      // Process all tweets asynchronously and wait for the results
      const tweetDataPromises = Array.from(tweetContainers).map(async (tweet) => {
        
        const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
        let tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : null;

        // Skip this tweet if no content is found
        if (!tweetText) {
          return null;
        }

        // Storin og twt text for uncensoring later
        originalTweets.push({ element: tweetTextElement, originalText: tweetText });

      
        let words = tweetText.split(/\s+/);
        let censoredText = "";

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const isNSFW = await checkNSFW(word);
          censoredText += (i > 0 ? " " : "") + (isNSFW ? "*".repeat(word.length) : word);
        }

        tweetTextElement.innerText = censoredText;


        if (!tweetTextElement.parentElement.querySelector(".uncensor-button")) {
          const uncensorButton = document.createElement("button");
          uncensorButton.innerText = "🚫";
          uncensorButton.classList.add("uncensor-button");
          uncensorButton.style.marginLeft = "5px";
          uncensorButton.style.fontSize = "12px";
          uncensorButton.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
          uncensorButton.style.border = "none";
          uncensorButton.style.cursor = "pointer";
          uncensorButton.style.width = "20px"; // Set width to fit one character
          uncensorButton.style.height = "20px"; // Set height to fit one character

          uncensorButton.addEventListener("click", () => {
            if (tweetTextElement.innerText === censoredText) {
              tweetTextElement.innerText = tweetText; // Reveal original text
            } else {
              tweetTextElement.innerText = censoredText; // Revert to censored text
            }
          });

          // Append the uncensor button next to the tweet text element
          tweetTextElement.parentElement.appendChild(uncensorButton);
        }

        // Return tweet content, username, and timestamp as an object
        const usernameElement = tweet.querySelector('a[role="link"] span');
        const username = usernameElement ? usernameElement.innerText.trim() : "Unknown";

        const timestampElement = tweet.querySelector("time");
        const timestamp = timestampElement ? timestampElement.getAttribute("datetime") : "Unknown time";

        return {
          content: censoredText,
          username: username,
          timestamp: timestamp,
        };
      });

      // Wait for all tweets to be processed and filter out null results
      const tweetData = (await Promise.all(tweetDataPromises)).filter((tweet) => tweet !== null);

      // Log the extracted tweets to the console
      console.log("Extracted Tweets:", tweetData);

      // Send the extracted tweet data to the server
      sendTweetsToServer(originalTweets);
    }, 1000); // Adjust the timeout as needed
  }

  // Function to send words to the server for NSFW classification
  async function checkNSFW(word) {
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweets: [{ text: word }] }),
      });

      const data = await response.json();
      if (data && data[0].label === "nsfw") {
        return true; // Word is NSFW
      } else {
        return false; // Word is safe
      }
    } catch (error) {
      console.error("Error sending word to the server:", error);
      return false; // In case of error, assume word is safe
    }
  }

  // Function to send tweets to the server (if needed for full tweet analysis)
  function sendTweetsToServer(tweets) {
    tweets.forEach((tweet) => {
      fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweets: [{ text: tweet.originalText }] }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Server Response for:", tweet.originalText, data);
          // You can handle NSFW classification at the tweet level here
        })
        .catch((error) => {
          console.error("Error sending tweet to the server:", error);
        });
    });
  }

  // Call the function to extract and censor tweets
  extractTweets();
})();
