(function() {
  // Function to extract and censor tweets from the page
  function extractTweets() {
    // Variable to store original tweet data
    let originalTweets = [];

    setTimeout(() => {
      // Select all <article> tags (tweets are typically wrapped in them)
      const tweetContainers = document.querySelectorAll('article');

      if (tweetContainers.length === 0) {
        console.log("No tweets found. The page might not have loaded fully or the structure has changed.");
        return;
      }

      const tweetData = Array.from(tweetContainers).map((tweet) => {
        // Extract the tweet content (from div[data-testid="tweetText"] or equivalent)
        const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
        let tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : null;

        // Skip this tweet if no content is found
        if (!tweetText) {
          return null;
        }

        // Store original tweet text for uncensoring later
        originalTweets.push({ element: tweetTextElement, originalText: tweetText });

        // Replace the entire tweet content with "*" in the HTML element
        tweetTextElement.innerText = "*";
        console.log("Censored tweet text:", tweetTextElement.innerText);

        // Check if an uncensor button already exists
        if (!tweetTextElement.parentElement.querySelector('.uncensor-button')) {
          // Create an uncensor button
          const uncensorButton = document.createElement('button');
          uncensorButton.innerText = '🚫';
          uncensorButton.classList.add('uncensor-button');
          uncensorButton.style.marginLeft = '5px';
          uncensorButton.style.fontSize = '12px';
          uncensorButton.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
          uncensorButton.style.border = 'none';
          uncensorButton.style.cursor = 'pointer';
          uncensorButton.style.width = '20px'; // Set width to fit one character
          uncensorButton.style.height = '20px'; // Set height to fit one character
          uncensorButton.addEventListener('click', () => {
            if (tweetTextElement.innerText === "*") {
              tweetTextElement.innerText = tweetText;
            } else {
              tweetTextElement.innerText = "*";
            }
          });
          // Append the uncensor button next to the tweet text element
          tweetTextElement.parentElement.appendChild(uncensorButton);
        }

        // Extract the username (usually in <span> with specific attributes)
        const usernameElement = tweet.querySelector('a[role="link"] span');
        const username = usernameElement ? usernameElement.innerText.trim() : "Unknown";

        // Extract the tweet timestamp (optional)
        const timestampElement = tweet.querySelector('time');
        const timestamp = timestampElement ? timestampElement.getAttribute('datetime') : "Unknown time";

        // Return tweet content, username, and timestamp as an object
        return {
          content: "*",
          username: username,
          timestamp: timestamp
        };
      }).filter(tweet => tweet !== null); // Filter out null values (skipped tweets)

      // Log the extracted tweets to the console
      console.log("Extracted Tweets:", tweetData);

      // Send the extracted tweet data to the background or popup (if using a Chrome extension)
      chrome.runtime?.sendMessage({ type: 'tweets', data: tweetData });
    }, 1000); // Adjust the timeout as needed
  }

  // Call the function to extract and censor tweets
  extractTweets();
})();