from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import transforms
from transformers import ViTForImageClassification, ViTConfig
from PIL import Image
import io
import requests

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load model architecture same as the training one
config = ViTConfig.from_pretrained("google/vit-base-patch16-224-in21k", num_labels=2)
model = ViTForImageClassification(config)

# Load trained model
model_path = "ML_Programs\\imgModelBlocker\\trainedModelTrial1.pth"
model.load_state_dict(torch.load(model_path, map_location=device))
model.to(device)
model.eval()

# Here img is converted to 224x224 resolution as ViT prefers it
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),  # Converting img to numerical format
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),  # These values make pxl to be in range of -1 to 1 instead of 0-1
])

@app.route('/predict', methods=['POST'])
def predict():
    if "imageUrl" not in request.json:
        return jsonify({"error": "No image URL provided."}), 400

    image_url = request.json['imageUrl']
    response = requests.get(image_url)
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch image from URL."}), 400

    image = Image.open(io.BytesIO(response.content)).convert("RGB")  # It ensures img is RGB else converts

    # Transform image
    transformed_img = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(transformed_img)  # Img sent to trained model
        prediction = torch.argmax(output.logits, dim=1).item()  # Getting predicted class (here we get probability of both class of img and picks the class with highest prob)
        label = -1 if prediction == 0 else 1  # Assigning labels (-1 means NSFW and 1 means SFW)

    return jsonify({'prediction': label})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)