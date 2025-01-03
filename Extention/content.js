// (function() {
//   // Function to extract and censor tweets from the page
//   function extractTweets() {
//     // Variable to store original tweet data
//     let originalTweets = [];

//     setTimeout(() => {
//       // Select all <article> tags (tweets are typically wrapped in them)
//       const tweetContainers = document.querySelectorAll('article');

//       if (tweetContainers.length === 0) {
//         console.log("No tweets found. The page might not have loaded fully or the structure has changed.");
//         return;
//       }

//       const tweetData = Array.from(tweetContainers).map((tweet) => {
//         // Extract the tweet content (from div[data-testid="tweetText"] or equivalent)
//         const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
//         let tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : null;

//         // Skip this tweet if no content is found
//         if (!tweetText) {
//           return null;
//         }

//         // Store original tweet text for uncensoring later
//         originalTweets.push({ element: tweetTextElement, originalText: tweetText });

//         function sendTweetsToServer(tweets) {
//           tweets.forEach(tweet => {
//             fetch('http://127.0.0.1:5000/analyze', {
//               method: 'POST',
//               headers: {
//                 'Content-Type': 'application/json'
//               },
//               body: JSON.stringify({ tweets: [{ text: tweet.text }] })
//             })
//             .then(response => response.json())
//             .then(data => {
//               console.log("Server Response for:", tweet.text, data);
//               if (data && data[0].label === "nsfw") {
//                 tweet.element.innerText = "⚠️ NSFW Content Hidden ⚠️"; // Replacin text if tweet as NSFW
//               }
//             })  
//             .catch(error => {
//               console.error("Error sending tweet to the server:", error);
//             });
//           });
//         }


//         // Replace the entire tweet content with "*" in the HTML element
//         tweetTextElement.innerText = "*";
//         console.log("Censored tweet text:", tweetTextElement.innerText);

//         // Check if an uncensor button already exists
//         if (!tweetTextElement.parentElement.querySelector('.uncensor-button')) {
//           // Create an uncensor button
//           const uncensorButton = document.createElement('button');
//           uncensorButton.innerText = '🚫';
//           uncensorButton.classList.add('uncensor-button');
//           uncensorButton.style.marginLeft = '5px';
//           uncensorButton.style.fontSize = '12px';
//           uncensorButton.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
//           uncensorButton.style.border = 'none';
//           uncensorButton.style.cursor = 'pointer';
//           uncensorButton.style.width = '20px'; // Set width to fit one character
//           uncensorButton.style.height = '20px'; // Set height to fit one character
//           uncensorButton.addEventListener('click', () => {
//             if (tweetTextElement.innerText === "*") {
//               tweetTextElement.innerText = tweetText;
//             } else {
//               tweetTextElement.innerText = "*";
//             }
//           });
//           // Append the uncensor button next to the tweet text element
//           tweetTextElement.parentElement.appendChild(uncensorButton);
//         }

//         // Extract the username (usually in <span> with specific attributes)
//         const usernameElement = tweet.querySelector('a[role="link"] span');
//         const username = usernameElement ? usernameElement.innerText.trim() : "Unknown";

//         // Extract the tweet timestamp (optional)
//         const timestampElement = tweet.querySelector('time');
//         const timestamp = timestampElement ? timestampElement.getAttribute('datetime') : "Unknown time";

//         // Return tweet content, username, and timestamp as an object
//         return {
//           content: "*",
//           username: username,
//           timestamp: timestamp
//         };
//       }).filter(tweet => tweet !== null); // Filter out null values (skipped tweets)

//       // Log the extracted tweets to the console
//       console.log("Extracted Tweets:", tweetData);

//       // Send the extracted tweet data to the background or popup (if using a Chrome extension)
//       chrome.runtime?.sendMessage({ type: 'tweets', data: tweetData });
//     }, 1000); // Adjust the timeout as needed
//   }

//   // Call the function to extract and censor tweets
//   extractTweets();
// })();


//================================================================
// (function() { 

//   function extractTweets() {
//     let originalTweets = [];

//     setTimeout(() => {
//       const tweetContainers = document.querySelectorAll('article');
//       if (tweetContainers.length === 0) {
//         console.log("No tweets found. The page might not have loaded fully or the structure has changed.");
//         return;
//       }

//       const tweetData = Array.from(tweetContainers).map((tweet) => {
//         const tweetTextElement = tweet.querySelector('div[data-testid="tweetText"]');
//         let tweetText = tweetTextElement ? tweetTextElement.innerText.trim() : null;

//         if (!tweetText) return null;

//         originalTweets.push({ element: tweetTextElement, text: tweetText });
//         tweetTextElement.innerText = "*";

//         return {
//           content: "*",
//           username: tweet.querySelector('a[role="link"] span')?.innerText.trim() || "Unknown",
//           timestamp: tweet.querySelector('time')?.getAttribute('datetime') || "Unknown time"
//         };
//       }).filter(tweet => tweet !== null);

//       console.log("Extracted Tweets:", tweetData);

//       sendTweetsToServer(originalTweets);
//     }, 1000);
//   }




//   extractTweets();
// })();
// ==================================================
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

        // List of words to censor (case insensitive)
        const censoredWords = ["fuck", "badword1", "badword2"]; // Add more words as needed

        // Replace the target words with asterisks (*)
        let censoredText = tweetText.replace(/\b(?:'|")?(\w+)(?:'|")?\b/g, function(match, word) {
          // Check if the word is in the censored words list (case insensitive)
          if (censoredWords.includes(word.toLowerCase())) {
            return "*".repeat(word.length); // Replace word with asterisks
          }
          return match; // Keep the word unchanged if it's not in the censored list
        });

        // Replace the entire tweet content with the censored text in the HTML element
        tweetTextElement.innerText = censoredText;
        console.log("Censored tweet text:", tweetTextElement.innerText);

        // Create an uncensor button if not already created
        if (!tweetTextElement.parentElement.querySelector('.uncensor-button')) {
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

          // Add event listener for uncensorship action
          uncensorButton.addEventListener('click', () => {
            if (tweetTextElement.innerText === censoredText) {
              tweetTextElement.innerText = tweetText; // Reveal original text
            } else {
              tweetTextElement.innerText = censoredText; // Revert to censored text
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
          content: censoredText,
          username: username,
          timestamp: timestamp
        };
      }).filter(tweet => tweet !== null); // Filter out null values (skipped tweets)

      // Log the extracted tweets to the console
      console.log("Extracted Tweets:", tweetData);

      // Send the extracted tweet data to the server
      sendTweetsToServer(originalTweets);
    }, 1000); // Adjust the timeout as needed
  }

  // Function to send tweets to the server
  function sendTweetsToServer(tweets) {
    tweets.forEach(tweet => {
      fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tweets: [{ text: tweet.originalText }] })
      })
      .then(response => response.json())
      .then(data => {
        console.log("Server Response for:", tweet.originalText, data);
        if (data && data[0].label === "nsfw") {
          // Handle NSFW flagged tweets separately
          tweet.element.innerText = "⚠️ NSFW Content Hidden ⚠️"; // Replacing text if tweet is NSFW
        }
      })
      .catch(error => {
        console.error("Error sending tweet to the server:", error);
      });
    });
  }

  // Call the function to extract and censor tweets
  extractTweets();
})();
