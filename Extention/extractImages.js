console.log("extractImage.js loaded");

// Server URL
const SERVER_URL = "http://127.0.0.1:5000/";

// Function to send image URL to the server and receive response
async function checkAndBlurImage(div) {
    // Extract background-image URL
    let bgImage = div.style.backgroundImage;
    let imageUrl = bgImage.match(/url\(["']?(.*?)["']?\)/);

    if (imageUrl && imageUrl[1]) {
        imageUrl = imageUrl[1]; // Get actual image URL
        console.log("Extracted Image URL:", imageUrl);

        try {
            // Send image URL to the server
            let response = await fetch(SERVER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_url: imageUrl }),
            });

            let data = await response.json();

            if (data.signal === -1) {
                // Blur image if server responds with -1
                div.style.filter = "blur(10px)";
                div.style.transition = "filter 0.3s ease-in-out";
                console.log("Image blurred as per server response.");
            } else {
                // Keep image normal
                div.style.filter = "none";
                console.log("Image remains normal.");
            }
        } catch (error) {
            console.error("Error contacting server:", error);
        }
    }
}

// Function to process all tweet images
function processTweetImages() {
    let imageDivs = document.querySelectorAll('div[style*="background-image"]');

    imageDivs.forEach((div) => {
        checkAndBlurImage(div);
    });
}

// Run on page load
processTweetImages();

// Observe new tweets dynamically
const observer = new MutationObserver(processTweetImages);
observer.observe(document.body, { childList: true, subtree: true });

console.log("MutationObserver started to track new tweets.");
