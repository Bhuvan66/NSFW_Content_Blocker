// Function to extract tweets from the page
function extractTweets() {
  setTimeout(() => {
    // Select all <article> tags (tweets are typically wrapped in them)
    const tweetContainers = document.querySelectorAll('article');
  
    if (tweetContainers.length === 0) {
      console.log("No tweets found. The page might not have loaded fully or the structure has changed.");
      return;
    }
  
    const tweetData = Array.from(tweetContainers).map((tweet) => {
      // Extract the tweet content (from div[data-testid="tweetText"])
      const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
      let tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : null;
  
      // Skip this tweet if no content is found
      if (!tweetText) {
        return null;
      }
  
      // Replace the entire tweet content with "***" in the HTML element
      tweetTextElement.innerText = "***";
  
      // Extract the username (usually in <span> with specific attributes)
      const usernameElement = tweet.querySelector('a[role="link"] span');
      const username = usernameElement ? usernameElement.innerText.trim() : "Unknown";
  
      // Extract the tweet timestamp (optional)
      const timestampElement = tweet.querySelector('time');
      const timestamp = timestampElement ? timestampElement.getAttribute('datetime') : "Unknown time";
      
      // Return tweet content, username, and timestamp as an object
      return { 
        content: "***", 
        username: username, 
        timestamp: timestamp 
      };
    }).filter(tweet => tweet !== null); // Filter out null values (skipped tweets)
  
    // Log the extracted tweets to the console
    console.log("Extracted Tweets:", tweetData);
  
    // Send the extracted tweet data to the background or popup (if using a Chrome extension)
    chrome.runtime?.sendMessage({ type: 'tweets', data: tweetData });
  }, 2000); // Wait for 2 seconds to ensure dynamic content has loaded
}

// Run the function to extract tweets
extractTweets();