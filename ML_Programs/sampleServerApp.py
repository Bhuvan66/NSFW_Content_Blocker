from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = Flask(__name__)
CORS(app)

try:
    # Initialize the model and tokenizer for the NSFW classifier
    tokenizer = AutoTokenizer.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    model = AutoModelForSequenceClassification.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    textClassifier = TextClassificationPipeline(model=model, tokenizer=tokenizer)
    print("Model and pipeline loaded successfully.")
except Exception as e:
    print(f"Error loading pipeline or model: {e}")
    exit(1)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """
    Endpoint to classify multiple texts and return results, including flagged NSFW words.
    """
    try:

        data = request.json
        tweets = data.get('tweets', [])

        if not tweets:
            return jsonify({"error": "No tweets provided."}), 400

        results = []
        for tweet_data in tweets:
            text = tweet_data.get('text', '')
            if not text:
                continue

            result = textClassifier(text)
            label = result[0]['label']
            score = result[0]['score']

            #contact me for this
            common_words = set(['that', 'right', 'favorite', 'reveals', 'artist', 'is', 'now'])

            flagged_words = []
            censored_text = text

            if label == "nsfw":

                for word in text.split():
                    if len(word) > 3 and word.lower() not in common_words:
                        flagged_words.append(word)
                        censored_text = censored_text.replace(word, "****")

            threshold = 0.994
            if label == "nsfw" and score < threshold:
                label = "uncertain"

            results.append({
                "text": censored_text,  # Send the censored text
                "label": label,
                "score": score,
                "flagged_words": flagged_words
            })

        return jsonify(results), 200
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
