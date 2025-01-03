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

@app.route('/analyze', methods=['POST'])
def analyze_text():
#sdgfvsfsdfdsfdsfd
    try:
        # Gettin  JSON data frm req
        data = request.json
        text = data.get('text', '')

        if not text:
            return jsonify({"errorrr": "failed to sent text????."}), 400

        # Classifin the txt
        result = textClassifier(text)
        label = result[0]['label']
        score = result[0]['score']


        flagged_words = []
        if label == "nsfw":
            flagged_words = [word for word in text.split() if len(word) > 3]
        
        # managin threshold val
        if label == "nsfw" and score < 0.955:
            label = "uncertain"

        #sendin resp to the ex
        return jsonify({
            "label": label,
            "score": score,
            "flagged_words": flagged_words
        }), 200
    except Exception as e:
        return jsonify({"errorrr": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
