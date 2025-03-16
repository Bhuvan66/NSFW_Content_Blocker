from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import transforms
from transformers import ViTForImageClassification, ViTConfig, AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline
from PIL import Image
import io
import requests
import os

app = Flask(__name__)
CORS(app)  # Allow requests from any origin

# Check for GPU
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load ViT image classification model
config = ViTConfig.from_pretrained("google/vit-base-patch16-224-in21k", num_labels=2)
model = ViTForImageClassification(config)
model_path = r"ML_Programs\\imgModelBlocker\\trainedModelTrial1.pth"
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# Define image transformation (224x224 for ViT)
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
])

# Load DistilBERT text classification model
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

try:
    tokenizer = AutoTokenizer.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    text_model = AutoModelForSequenceClassification.from_pretrained("eliasalbouzidi/distilbert-nsfw-text-classifier")
    textClassifier = TextClassificationPipeline(model=text_model, tokenizer=tokenizer)
    print("Text classifier loaded successfully.")
except Exception as e:
    print(f"Error loading text classifier: {e}")
    exit(1)

def load_image_from_request():
    """ Load image from request (supports both uploaded files and image URLs). """
    if "image" in request.files:  # File upload
        image_file = request.files['image']
        image = Image.open(io.BytesIO(image_file.read())).convert("RGB")
        return image
    elif "url" in request.json:  # URL input
        image_url = request.json["url"]
        try:
            response = requests.get(image_url, timeout=5)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content)).convert("RGB")
            return image
        except requests.RequestException as e:
            raise ValueError(f"Failed to fetch image from URL: {e}")
    else:
        raise ValueError("No valid image source provided.")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        image = load_image_from_request()
        transformed_img = transform(image).unsqueeze(0).to(device)
        with torch.no_grad():
            output = model(transformed_img)
            prediction = torch.argmax(output.logits, dim=1).item()
            label = -1 if prediction == 0 else 1  # -1 = NSFW, 1 = SFW
        return jsonify({"prediction": label, "message": "Processed successfully"})
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """ Endpoint to classify multiple texts and return results. """
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
            threshold = 0.994
            if label == "nsfw" and score < threshold:
                label = "uncertain"

            results.append({
                "text": text,
                "label": label,
                "score": score
            })

        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)