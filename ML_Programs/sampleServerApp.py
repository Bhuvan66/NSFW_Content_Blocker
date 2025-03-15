# text
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = Flask(__name__)
CORS(app)

try:
    tokenizer = AutoTokenizer.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    model = AutoModelForSequenceClassification.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    textClassifier = TextClassificationPipeline(model=model, tokenizer=tokenizer)
    print("Model and pipeline loaded successfully.")
except Exception as e:
    print(f"Error loading pipeline or model: {e}")
    exit(1)

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.json
        print("Received data:", data)  # Debugging

        if not data or 'tweets' not in data:
            return jsonify({"error": "Invalid request format."}), 400

        tweets = data['tweets']
        if not isinstance(tweets, list):
            return jsonify({"error": "Expected a list of tweets."}), 400

        results = []
        for tweet_data in tweets:
            if not isinstance(tweet_data, dict) or 'text' not in tweet_data:
                continue

            text = tweet_data['text'].strip()
            if not text:
                continue  # Skip empty tweets

            try:
                result = textClassifier(text)
                if not result or len(result) == 0:
                    print("Warning: Empty classification result for:", text)
                    continue

                label = result[0].get('label', 'unknown')
                score = result[0].get('score', 0)

                threshold = 0.994
                if label == "nsfw" and score < threshold:
                    label = "uncertain"

                results.append({
                    "text": text,
                    "label": label,
                    "score": score
                })

            except Exception as model_error:
                print(f"Model error for text: {text} - {model_error}")
                results.append({
                    "text": text,
                    "label": "error",
                    "score": 0
                })

        return jsonify(results), 200

    except Exception as e:
        print("Error in analyze_text:", str(e))
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
