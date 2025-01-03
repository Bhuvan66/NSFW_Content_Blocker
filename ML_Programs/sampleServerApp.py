from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline


os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

app = Flask(__name__)
CORS(app)

try:
    pipe = pipeline("text-classification", model="eliasalbouzidi/distilbert-nsfw-text-classifier")
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
        # Getin JSON data frm the req
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

            common_words = set(['that', 'right', 'favorite', 'reveals', 'artist', 'is', 'now'])

            flagged_words = []
            if label == "nsfw":
                flagged_words = [word for word in text.split() if len(word) > 3 and word.lower() not in common_words]

            # # Adjust the label if below the threshold
            # if label == "nsfw" and score < 0.955:
            #     label = "uncertain"

            # Log flagged words for debugging
            print("Flagged Words for tweet:", text, flagged_words)

            
            # flagged_words = []
            # if label == "nsfw":
            #     flagged_words = [word for word in text.split() if len(word) > 3]


            threshold = 0.994
            if label == "nsfw" and score < threshold:
                label = "uncertain"
            
            print("Flagged Words for tweet:", text, flagged_words)


            results.append({
                "text": text,
                "label": label,
                "score": score,
                "flagged_words": flagged_words
            })

        # Sendin the response to ex
        return jsonify(results), 200
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
