(function () {

  async function extractTweets() {

    let originalTweets = [];
    swearWordList = [
      '2g1c', 'Asshole', 'Bastard', 'Bitch', 'Bloody', 'Blowjob', 'Bullshit',
      'Clusterfuck', 'Cock', 'Cocksucker', 'Cunt', 'Dick', 'Faggot', 'Fuck',
      'Fuckery', 'Healslut', 'Jesus Fuckin Christ', 'Kike', 'Motherfucker',
      'Nigga', 'Nigger', 'Poofter', 'Prick', 'Pussy', 'Ratfucking', 'Retard',
      'Shit', 'Shithouse', 'Shitposting', 'Shitter', 'Slut', 'Son of a bitch',
      'Twat', 'Unclefucker', 'Wanker', 'Whore', 'acrotomophilia', 'anal',
      'anilingus', 'anus', 'apeshit', 'arsehole', 'ass', 'asshole', 'assmunch',
      'babeland', 'ball', 'bang', 'bangbros', 'bangbus', 'bareback', 'barenaked',
      'bastard', 'bastardo', 'bastinado', 'batter', 'bbw', 'bdsm', 'beaner',
      'beaners', 'beastiality', 'bestiality', 'big cock', 'bimbos', 'birdlock',
      'bitch', 'bitches', 'blowjob', 'blumpkin', 'bollocks', 'bondage', 'boner',
      'boob', 'boobs', 'booty', 'breasts', 'bukkake', 'busty', 'butt', 'buttcheeks',
      'butthole', 'camgirl', 'camslut', 'camwhore', 'chick', 'cleaver', 'cleveland',
      'clit', 'clitoris', 'clusterfuck', 'cock', 'cocks', 'cum', 'coon', 'coons',
      'coprolagnia', 'coprophilia', 'cornhole', 'cowgirl', 'creampie', 'cum',
      'cumming', 'cumshot', 'cumshots', 'cunnilingus', 'cunt', 'cup', 'damn',
      'darkie', 'date', 'daterape', 'deepthroat', 'dendrophilia', 'dick', 'dildo',
      'dingleberries', 'dingleberry', 'doggie', 'doggiestyle', 'doggy', 'doggystyle',
      'dp', 'double penetration', 'ecchi', 'ejaculation', 'erotic', 'erotism',
      'eunuch', 'faggot', 'femdom', 'fetish', 'figging', 'fingerbang', 'fingering',
      'fisting', 'footjob', 'frotting', 'fuck', 'fuckin', 'fucking', 'fucktards',
      'fudge', 'fudgepacker', 'futanari', 'g-spot', 'gag', 'gang', 'gangbang',
      'gay', 'goregasm', 'grope', 'handjob', 'hardcore', 'hentai', 'hole', 'homoerotic',
      'honkey', 'hooker', 'horny', 'humping', 'incest', 'intercourse', 'jack', 'jerk',
      'kinkster', 'kinky', 'knobbing', 'knockers', 'livesex', 'masturbate', 'masturbating',
      'masturbation', 'milf', 'missionary', 'motherfucker', 'murder', 'negro', 'nig',
      'nigga', 'nigger', 'nympho', 'nymphomania', 'octopussy', 'orgasm', 'orgy',
      'paedophile', 'panties', 'panty', 'pedophile', 'pegging', 'penetration', 'penis',
      'pissing', 'pisspig', 'porn', 'porno', 'pornography', 'pussy', 'queaf', 'queef',
      'quim', 'raghead', 'raging', 'rape', 'raping', 'rapist', 'rimjob', 'rimming',
      'scat', 'schlong', 'scissoring', 'semen', 'sex', 'sexcam', 'sexo', 'sexual',
      'sexuality', 'sexually', 'sexy', 'shaved', 'shemale', 'shibari', 'shit', 'shitblimp',
      'shitty', 'shota', 'sisterfucker', 'slut', 'smut', 'snowballing', 'squirting',
      'strapon', 'suck', 'sucking', 'suicide', 'sultry', 'swinger', 'threesome', 'throat',
      'throating', 'tit', 'tits', 'titties', 'titty', 'tubgirl', 'tushy', 'twat', 'twink',
      'vagina', 'venus', 'viagra', 'vibrator', 'wank', 'wet', 'wetback', 'whore', 'worldsex',
      'wtf', 'xx', 'xxx', 'yaoi', 'yiffy', '🖕'
    ];

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

        const isTweetNSFW = await checkNSFW(tweetText);
        let words = tweetText.split(/\s+/);
        let censoredText = "";
        let hasCensoredWords = false;

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const isNSFWWord = swearWordList.includes(word.toLowerCase());
          if (isTweetNSFW && isNSFWWord) {
            hasCensoredWords = true;
            censoredText += (i > 0 ? " " : "") + "*".repeat(word.length);
          } else {
            censoredText += (i > 0 ? " " : "") + word;
          }
        }

        tweetTextElement.innerText = censoredText;

        if (hasCensoredWords && !tweetTextElement.parentElement.querySelector(".uncensor-button")) {
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
  async function checkNSFW(text) {
    try {
      const response = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweets: [{ text: text }] }),
      });

      const data = await response.json();
      if (data && data[0].label === "nsfw") {
        return true; // Tweet is NSFW
      } else {
        return false; // Tweet is safe
      }
    } catch (error) {
      console.error("Error sending text to the server:", error);
      return false; // In case of error, assume tweet is safe
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
